import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => {
    return res.render("join", { pageTitle: "Join" });
}

export const postJoin = async (req, res) => {
    const {name, username, password, password2, email, location } = req.body;
    const pageTitle = "Join";
    if (password !== password2) {
        return res.status(400).render("join", { pageTitle, errorMessage: "Password confirmation does not match." });
    }
    const exists = await User.exists({ $or: [{ username }, { email }] });
    if(exists){
        return res.status(400).render("join", { pageTitle, errorMessage: "This username/email is already taken." });
    }
    try {
        await User.create({ name, username, password, email, location });
        return res.redirect("/login");
    } catch(error) {
        return res.status(400).render("join", { pageTitle, errorMessage: error._message });
    }
    
}

export const getLogin = (req, res) => {
    return res.render("login", { pageTitle: "Login" });
}

export const postLogin = async (req, res) => {
    const { username, password } = req.body;
    const pageTitle = "Login";
    const user = await User.findOne({ username, socialOnly: false });
    if(!user){
        return res.status(400).render("login", { pageTitle, errorMessage: "An account with this username does not exist." });
    }
    const ok = await bcrypt.compare(password, user.password);
    if(!ok){
        return res.status(400).render("login", { pageTitle, errorMessage: "Wrong password",});
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
}

export const startGithubLogin = (req, res) => {
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config = {
        client_id: process.env.GH_CLIENT,
        allow_signup: false,
        scope: "read:user user:email",
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
}

export const finishGithubLogin = async (req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code,
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await ( await fetch(finalUrl, {
        method: "POST",
        headers: {
            Accept: "application/json",
        },
    })).json();
    if("access_token" in tokenRequest) {
        const {access_token} = tokenRequest;
        const apiUrl = "https://api.github.com"
        const userData = await ( await fetch(`${apiUrl}/user`, {
            headers: {
                Authorization: `token ${access_token}`,
            },
        })).json();
        const emailData = await ( await fetch(`${apiUrl}/user/emails` , {
            headers: {
                Authorization: `token ${access_token}` ,
            },
        })).json();
        const emailObj = emailData.find((email) => email.primary === true && email.verified === true);
        if(!emailObj) {
            return res.redirect("/login");
        }
        let user = await User.findOne({ email: emailObj.email });
        if(!user) {
            user = await User.create({
                name: userData.name,
                username: userData.login,
                email: emailObj.email,
                password: "",
                socialOnly: true,
                location: userData.location,
                avatarUrl: userData.avatar_url,
            });
        }   
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");
    } else {
        return res.redirect("/login");
    }
}

export const logout = (req, res) => {
    req.session.destroy();
    return res.redirect("/");
}

export const getEdit = (req, res) => {
    return res.render("edit-profile", { pageTitle: "Edit Profile" });
}

export const postEdit = async (req, res) => {
    const {
        session: {
            user: { _id, avatarUrl, email: searchEmail, username: searchUsername },
        },
        body: { name, email, username, location },
        file,
    } = req;

    const existsUser = await User.exists({username});
    if(existsUser){
        if(username !== searchUsername){
            return res.status(400).render("edit-profile", { pageTitle: "Edit Profile", errorMessage: "User is already exists." });
        };
    };

    const existsEmail = await User.exists({email});
    if(existsEmail){
        if(email !== searchEmail){
            return res.status(400).render("edit-profile", { pageTitle: "Edit Profile", errorMessage: "Email is already exists." });
        };
    };

    await User.findByIdAndUpdate(_id, {
        name, email, username, location,
    });
    
    const updatedUser = await User.findByIdAndUpdate(
        _id, 
        {
            avatarUrl: file ? file.location : avatarUrl,
            name,
            email,
            username,
            location,
        }, 
        { new: true }
    );
    
    req.session.user = updatedUser;
    return res.redirect("/users/edit");
}

export const getChangePassword = (req, res) => {
    if(req.session.user.socialOnly === true) {
        req.flash("error", "Can't change password.");
        return res.redirect("/"); 
    }
    return res.render("change-password", { pageTitle:"Change Password" });
}

export const postChangePassword = async (req, res) => {
    const {
        session: {
            user: { _id },
        },
        body: { oldPw, newPw, newPwC },
    } = req;
    const ok = await bcrypt.compare(oldPw, user.password);
    if(!ok) {
        return res.status(400).render("users/change-password", { pageTitle: "Change Password", errorMessage: "The Current password is incorrect." });
    }
    if (newPw !== newPwC) {
        return res.status(400).render("users/change-password", { pageTitle: "Change Password", errorMessage: "The password does not match." });
    }
    const user = await User.findId(_id);
    user.password = newPw;
    await user.save();
    req.flash("info", "Password Updated");
    return res.redirect("/users/logout");
}

export const see = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id).populate({
        path: "videos",
        populate: {
            path: "owner",
            model: "User",
        },
    });
    console.log(id);
    console.log(user);
    if(!user){
        return res.status(404).render("404", { pageTitle: "User not found." });
    }
    return res.render("profile", { pageTitle: user.name, user });
};