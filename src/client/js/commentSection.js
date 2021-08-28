const { default: fetch } = require("node-fetch");

const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const delBtn = document.querySelectorAll(".video__comment-delBtn");

const addComment = (text, id) => {
    const videoComments = document.querySelector(".video__comments ul");
    const newComment = document.createElement("li");
    newComment.dataset.id = id;
    newComment.className = "video__comment";
    const icon = document.createElement("i");
    icon.className = "fas fa-comment";
    const span = document.createElement("span");
    span.classList = "commentText";
    span.innerText = ` ${text}`;
    const span2 = document.createElement("span");
    span2.classList = "video__comment-delBtn";
    span2.innerText = "❌";
    span2.addEventListener("click", handleDelete);
    newComment.appendChild(icon);
    newComment.appendChild(span);
    newComment.appendChild(span2);
    videoComments.prepend(newComment);
}

const handleSubmit = async (event) => {
    event.preventDefault();
    const textarea = form.querySelector("textarea");
    const text = textarea.value;
    const videoId = videoContainer.dataset.id;
    if(text === "") {
        return;
    }
    const response = await fetch(`/api/videos/${videoId}/comment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
    });
    if(response.status === 201) {
        textarea.value = "";
        const { newCommentId } = await response.json();
        addComment(text, newCommentId);
    }
};

const handleDelete = async (event) => {
    const comment = event.target.parentElement;
    const commentId = comment.dataset.id;
    const response = await fetch(`/api/comments/${commentId}/delete`, {
        method: "DELETE",
        headers: {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify({ commentId }),
    });
    if(response.status === 201){
        comment.remove();
    }
}

if(form) {
    form.addEventListener("submit", handleSubmit);
}

delBtn.forEach((item) => {
    item.addEventListener("click", handleDelete);
})

// challenge
// const delete = await fetch(`/api/comments/%{commentId}`, {
//   method: "DELETE",
//   ~~~~~~~~
// })
//
// * click event listener.
// 2nd - 사용자가 댓글 작성자가 맞는지 확인한다.
// 3rd - 모든 절차가 맞다면 삭제하도록 한다.