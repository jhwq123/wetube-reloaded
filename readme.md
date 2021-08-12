# Wetube Reloaded

## global routar (  /  )
/ -> Home
/join -> Join
/login -> Login
/search -> Search

## router (  /users  )
/users/:id -> See User
/users/logout -> Log Out
/users/edit -> Edit My Profile
/users/delete -> Delete My Profile

## router (  /videos  )
/videos/:id -> See Video
/videos/:id/edit -> Edit Video
/videos/:id/delete -> Delete Video
/videos/upload -> Upload Video


/videos/comments -> Comments on a video
/videos/comments/delete -> Delete A Comment of a Video


/* 
<< JS version >>

console.log("start");
Video.find({}, (error, videos) => {
    if(error){
        return res.render("server-error");
    }
    return res.render("home", { pageTitle: "Home", videos });
});
console.log("finished");


<< await, async version >>

try {
    const videos = await Video.find({});
    return res.render("home", { pageTitle: "Home", videos: [] });
} catch(error) {
    return res.render("server-error", {error});
}    

*/



/*
<< one option >>

try {
    await video.create({
        title: title,
        description: description,
        createdAt: Date.now(),
        hashtags: hashtags.split(",").map((word) => word.startsWith('#') ? word : `#${word}`);
    });
    return res.redirect("/");
} catch (error) {
    return res.render("upload", { pageTitle: "Upload video", errorMessage: error._message, });
}


<< two option >>

if(!video){
    return res.render("404", { pageTitle: "Video not found." });
}
await Video.findByIdAndUpdate(id, {
    title, 
    description, 
    hashtags: hashtags.split(",").map((word) => (word.startsWith('#') ? word : `#${word}`)),
});

*/