// Get DOM elements using IDs from your HTML (camelCase style)
const postList = document.getElementById('postList'); // Container for post titles
const postDetail = document.getElementById('postDetail'); // Display area for selected post

const newPostForm = document.getElementById('newPostForm'); // Form to add new post
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const contentInput = document.getElementById('content');
const imageInput = document.getElementById('image');

const editPostForm = document.getElementById('editPostForm'); // Form to edit post
const editTitle = document.getElementById('editTitle');
const editContent = document.getElementById('editContent');
const cancelEdit = document.getElementById('cancelEdit');

let currentPostId = null; // To track which post is selected for editing/viewing

// Main function to start everything after page loads
function main() {
  loadPosts();

  // Event listener for submitting new post
  newPostForm.addEventListener('submit', addNewPost);

  // Event listener for submitting edited post
  editPostForm.addEventListener('submit', updatePost);

  // Event listener for canceling edit
  cancelEdit.addEventListener('click', () => {
    editPostForm.classList.add('hidden');
    postDetail.style.display = 'block';
  });
}

// Fetch all posts and display their titles
function loadPosts() {
  fetch('http://localhost:3000/posts')
    .then(response => response.json())
    .then(posts => {
      renderPostList(posts);
      if (posts.length > 0) {
        handlePostClick(posts[0].id); // Show first post on page load
      } else {
        postDetail.innerHTML = 'No posts available.';
      }
    })
    .catch(() => alert('Failed to load posts from server.'));
}

// Render the list of post titles
function renderPostList(posts) {
  postList.innerHTML = ''; // Clear current list

  posts.forEach(post => {
    const postDiv = document.createElement('div');
    postDiv.textContent = post.title;
    postDiv.classList.add('postItem');
    postDiv.style.cursor = 'pointer';

    // Click listener to display post details
    postDiv.addEventListener('click', () => handlePostClick(post.id));

    postList.appendChild(postDiv);
  });
}

// Fetch and show the details of a single post by id
function handlePostClick(id) {
  fetch(`http://localhost:3000/posts/${id}`)
    .then(response => response.json())
    .then(post => {
      currentPostId = post.id; // Save current post id
      postDetail.style.display = 'block';
      editPostForm.classList.add('hidden'); // Hide edit form if visible

      postDetail.innerHTML = `
        <h2>${post.title}</h2>
        <p><strong>By:</strong> ${post.author}</p>
        ${post.image ? `<img src="${post.image}" alt="${post.title}" style="max-width: 100%; margin: 1rem 0;" />` : ''}
        <p>${post.content}</p>
        <button id="editBtn">Edit</button>
        <button id="deleteBtn" style="background-color: crimson; color: white; margin-top: 1rem;">Delete Post</button>
      `;

      // Attach event listeners AFTER the buttons exist in the DOM
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

// Add a new post from the newPostForm inputs
function addNewPost(event) {
  event.preventDefault();

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
    .then(response => response.json())
    .then(() => {
      newPostForm.reset();
      loadPosts();
    })
    .catch(() => alert('Failed to add new post.'));
}

// Update an existing post after editing
function updatePost(event) {
  event.preventDefault();

  if (!currentPostId) {
    alert('No post selected for editing.');
    return;
  }

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
    .then(response => response.json())
    .then(() => {
      editPostForm.classList.add('hidden');
      postDetail.style.display = 'block';
      loadPosts();
      handlePostClick(currentPostId);
    })
    .catch(() => alert('Failed to update the post.'));
}

// Delete a post by id
function deletePost(id) {
  if (!confirm('Are you sure you want to delete this post?')) return;

  fetch(`http://localhost:3000/posts/${id}`, { method: 'DELETE' })
    .then(response => {
      if (!response.ok) throw new Error('Delete failed');
      if (currentPostId === id) {
        postDetail.innerHTML = 'Post deleted.';
        currentPostId = null;
      }
      loadPosts();
    })
    .catch(() => alert('Failed to delete post.'));
}

// Start the app
main();


