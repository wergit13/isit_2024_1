import { Methods, vkApiRequest, vkAuthorise } from "./vk_api.js";

const root = document.querySelector("root");

function parseUrl(url) {
    const parsed = new URL(url);
    let w = parsed.searchParams.get('w')
    if ( w === undefined) {
        return {error: 'Not post url'};
    }
    w = w.substring(4);
    const arr = w.split("_");
    if (arr[0] !== undefined && arr[1] !== undefined) {
        return {
            owner_id: arr[0],
            post_id: arr[1].split('/')[0]
        };
    } else {
        return {error: 'Not post url'};
    }
}

function safeComment(message) {
    return `Posted for isit lab don't give attention
    
    ${message}
    
    __________________`
}


function showPosts(root, friends) {
    friends = friends.map((u) => {
        return `<tr class="post" id="${u.owner_id}_${u.id}">
            <td>${u.attachments.length > 0 && u.attachments[0].type === "photo" ? `<img src="${u.attachments[0].photo.sizes[0].url}"></img>`: "-"}</td>
            <td>${u.text}</td>
            <td>${(new Date(parseInt(u.date) * 1000)).toLocaleDateString("en-US")}</td>
        </tr>`   
    }).join('');
    const str = `<table>
    <tbody>
    <tr>
        <th>Photo</th>
        <th>Text</th>
        <th>Date</th>
    </tr>
    ${friends}
    </tbody>
    </table>`;
    root.innerHTML = str;
}

function renderStart() {
    root.innerHTML = `<div class="cont">
    <div>
    <h2>Posts</h2>
    <input id="user_id" type="text" placeholder="user_id"/>
    <button id="get_posts">Get Posts</button>
    <div class="p_root">
    
    </div>
    </div>

    <div class="comment-form">
        <form>
            <h2>Write comment</h2>
            <div>
                <textarea id="comment_text" placeholder="comment"> </textarea>
            </div>
            <button id="btn" type="commit">Send</button>
        </form>
        <div id="res"></div>
    </div>
    </div>
    `;
    const commentForm = document.querySelector('.comment-form');
    commentForm.style.visibility = "hidden";
    const userInput = document.getElementById("user_id");
    const postsRoot = document.querySelector(".p_root");
    const postsBtn = document.getElementById('get_posts');
    postsBtn.addEventListener('click', () => {
        commentForm.style.visibility = "hidden";
        const userId = userInput.value.trim();
        if( userId === '')
            return;

        const responce = vkApiRequest(Methods.GetPosts, {domain: userId});
        responce.then(
            (res) => {
                console.log(res);
                showPosts(postsRoot, res.items);
            },
            (err) => {
                console.log(err)
                postsRoot.innerHTML = "error: " + err.error_msg;
            }
        )
    });

    let selectedOwner = '';
    let selectedId = '';

    document.querySelector(".p_root").addEventListener('click', (e)=>{
        let post = null;
        if(e.target.classList.contains('post')){
            post = e.target;
        } else if(e.target.parentElement.classList.contains('post')){
            post = e.target.parentElement;
        } else if(e.target.parentElement.parentElement.classList.contains('post')){
            post = e.target.parentElement.parentElement;
        }
        if (post === null)
            return;
        let ids = post.id.split("_")
        selectedOwner = ids[0];
        selectedId = ids[1];
        const prev = document.querySelector('.selected');
        if( prev === null) {
            post.classList.toggle("selected");
            commentForm.style.visibility = "visible";
            return;
        }
        if(prev.id === post.id)
            return;
        prev.classList.toggle('selected');
        post.classList.toggle('selected');
    });

    const commentInput = document.getElementById('comment_text');
    const button = document.getElementById('btn');
    const resultField = document.getElementById('res');
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const comment = commentInput.value.trim();
        if(comment === ''){
            resultField.innerHTML = "Fields must be not empty"
            return;
        }

        vkApiRequest(Methods.CommentPost, {
            owner_id: selectedOwner,
            post_id: selectedId,
            message: safeComment(comment)
        }).then((result) =>{
            resultField.innerHTML = 'Comment succsefully added';
            console.log(result);
        },
        (err) => {
            console.log(err);
            resultField.innerHTML = 'error:  ' + err.error_msg;
        });
        resultField.innerHTML = 'loading...';
        commentInput.value = '';
    })
}


const main = () => {
    renderStart();

}

main();