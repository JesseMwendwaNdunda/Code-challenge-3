
const postList = document.getElementById('postList');
const postDetail = document.getElementById('postDetail');

const newPostForm = document.getElementById('newPostForm');
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const contentInput = document.getElementById('content');
const imageInput = document.getElementById('image');

const editPostForm = document.getElementById('editPostForm');
const editTitle = document.getElementById('editTitle');
const editContent = document.getElementById('editContent');
const cancelEdit = document.getElementById('cancelEdit');

let currentPostId = null;

function main() {
  loadPosts();

  newPostForm.addEventListener('submit', addNewPost);
  editPostForm.addEventListener('submit', updatePost);
  cancelEdit.addEventListener('click', () => {
    editPostForm.classList.add('hidden');
    postDetail.style.display = 'block';
  });
}

function loadPosts() {
  fetch('http://localhost:3000/posts')
    .then(res => res.json())
    .then(posts => {
      renderPostList(posts);
      if (posts.length > 0) {
        handlePostClick(posts[0].id);
      } else {
        postDetail.innerHTML = 'No posts yet.';
      }
    })
    .catch(() => alert('Failed to load posts from server.'));
}

function renderPostList(posts) {
  postList.innerHTML = '';
  posts.forEach(post => {
    const div = document.createElement('div');
    div.textContent = post.title;
    div.classList.add('postItem');
    div.addEventListener('click', () => handlePostClick(post.id));
    postList.appendChild(div);
  });
}

function handlePostClick(id) {
  fetch(`http://localhost:3000/posts/${id}`)
    .then(res => res.json())
    .then(post => {
      currentPostId = post.id;
      postDetail.style.display = 'block';
      editPostForm.classList.add('hidden');

      postDetail.innerHTML = `
        <h2>${post.title}</h2>
        <p><strong>By:</strong> ${post.author}</p>
        ${post.image ? `<img src="${post.image}" alt="${post.title}" style="max-width:100%; margin:1rem 0;">` : ''}
        <p>${post.content}</p>
        <button id="editBtn">Edit</button>
        <button id="deleteBtn">Delete</button>
      `;

      document.getElementById('editBtn').addEventListener('click', () => {
        editPostForm.classList.remove('hidden');
        postDetail.style.display = 'none';
        editTitle.value = post.title;
        editContent.value = post.content;
      });

      document.getElementById('deleteBtn').addEventListener('click', () => deletePost(post.id));
    })
    .catch(() => {
      postDetail.innerHTML = '<p style="color:red;">Failed to load post details.</p>';
    });
}

function addNewPost(e) {
  e.preventDefault();

  const newPost = {
    title: titleInput.value.trim(),
    author: authorInput.value.trim(),
    content: contentInput.value.trim(),
    image: imageInput.value.trim() || null,
  };

  if (!newPost.title || !newPost.author || !newPost.content) {
    alert('Please fill in all required fields.');
    return;
  }

  fetch('http://localhost:3000/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newPost),
  })
    .then(res => res.json())
    .then(() => {
      newPostForm.reset();
      loadPosts();
    })
    .catch(() => alert('Failed to add new post.'));
}

function updatePost(e) {
  e.preventDefault();

  if (!currentPostId) return alert('No post selected for editing.');

  const updatedPost = {
    title: editTitle.value.trim(),
    content: editContent.value.trim(),
  };

  if (!updatedPost.title || !updatedPost.content) {
    alert('Please fill in all required fields.');
    return;
  }

  fetch(`http://localhost:3000/posts/${currentPostId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedPost),
  })
    .then(res => res.json())
    .then(() => {
      editPostForm.classList.add('hidden');
      postDetail.style.display = 'block';
      loadPosts();
      handlePostClick(currentPostId);
    })
    .catch(() => alert('Failed to update the post.'));
}

function deletePost(id) {
  if (!confirm('Are you sure you want to delete this post?')) return;

  fetch(`http://localhost:3000/posts/${id}`, { method: 'DELETE' })
    .then(res => {
      if (!res.ok) throw new Error('Delete failed');
      if (currentPostId === id) {
        postDetail.innerHTML = 'Post deleted.';
        currentPostId = null;
      }
      loadPosts();
    })
    .catch(() => alert('Failed to delete post.'));
}

main();

