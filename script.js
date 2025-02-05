// Blog Class - จัดการบล็อก
class Blog {
  constructor(id, title, content, tags) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.tags = tags.split(",").map((tag) => tag.trim());
    this.createdDate = new Date();
    this.updatedDate = new Date();
  }

  update(title, content, tags) {
    this.title = title;
    this.content = content;
    this.tags = tags.split(",").map((tag) => tag.trim());
    this.updatedDate = new Date();
  }

  getFormattedDate() {
    return this.updatedDate.toLocaleString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

// BlogManager Class - จัดการ array บล็อก
class BlogManager {
  constructor() {
    this.loadBlogs();
  }

  loadBlogs() {
    const storedBlogs = JSON.parse(localStorage.getItem("blogs")) || [];
    this.blogs = storedBlogs.map((blog) => {
      let newBlog = new Blog(blog.id, blog.title, blog.content, blog.tags.join(", "));
      newBlog.createdDate = new Date(blog.createdDate);
      newBlog.updatedDate = new Date(blog.updatedDate);
      return newBlog;
    });
    this.sortBlogs();
  }

  saveBlogs() {
    localStorage.setItem("blogs", JSON.stringify(this.blogs));
  }

  addBlog(title, content, tags) {
    const blog = new Blog(Date.now(), title, content, tags);
    this.blogs.push(blog);
    this.sortBlogs();
    this.saveBlogs();
    return blog;
  }

  updateBlog(id, title, content, tags) {
    const blog = this.getBlog(id);
    if (blog) {
      blog.update(title, content, tags);
      this.sortBlogs();
      this.saveBlogs();
    }
    return blog;
  }

  deleteBlog(id) {
    this.blogs = this.blogs.filter((blog) => blog.id !== id);
    this.saveBlogs();
  }

  getBlog(id) {
    return this.blogs.find((blog) => blog.id === id);
  }

  sortBlogs() {
    this.blogs.sort((a, b) => b.updatedDate - a.updatedDate);
    this.saveBlogs();
  }

  filterBlogs(tag) {
    return this.blogs.filter((blog) => blog.tags.includes(tag));
  }
}

// UI Class - จัดการ DOM และ Event
class BlogUI {
  constructor(blogManager) {
    this.blogManager = blogManager;
    this.initElements();
    this.initEventListeners();
    this.render();
  }

  initElements() {
    this.form = document.getElementById("blog-form");
    this.titleInput = document.getElementById("title");
    this.contentInput = document.getElementById("content");
    this.tagsInput = document.getElementById("tags");
    this.editIdInput = document.getElementById("edit-id");
    this.formTitle = document.getElementById("form-title");
    this.cancelBtn = document.getElementById("cancel-btn");
    this.blogList = document.getElementById("blog-list");
    this.tagFilter = document.getElementById("tag-filter");
  }

  initEventListeners() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    this.cancelBtn.addEventListener("click", () => {
      this.resetForm();
    });

    this.tagFilter.addEventListener("change", () => {
      this.render();
    });
  }

  handleSubmit() {
    const title = this.titleInput.value.trim();
    const content = this.contentInput.value.trim();
    const tags = this.tagsInput.value.trim();
    const editId = parseInt(this.editIdInput.value);

    if (title && content) {
      if (editId) {
        this.blogManager.updateBlog(editId, title, content, tags);
      } else {
        this.blogManager.addBlog(title, content, tags);
      }
      this.resetForm();
      this.render();
    }
  }

  editBlog(id) {
    const blog = this.blogManager.getBlog(id);
    if (blog) {
      this.titleInput.value = blog.title;
      this.contentInput.value = blog.content;
      this.tagsInput.value = blog.tags.join(", ");
      this.editIdInput.value = blog.id;
      this.formTitle.textContent = "แก้ไขบล็อก";
      this.cancelBtn.classList.remove("hidden");
      window.scrollTo(0, 0);
    }
  }

  deleteBlog(id) {
    if (confirm("ต้องการลบใช่ไหม")) {
      this.blogManager.deleteBlog(id);
      this.render();
    }
  }

  resetForm() {
    this.form.reset();
    this.editIdInput.value = "";
    this.formTitle.textContent = "เขียนบล็อกใหม่";
    this.cancelBtn.classList.add("hidden");
  }

  render() {
    const selectedTag = this.tagFilter.value;
    let blogs = selectedTag ? this.blogManager.filterBlogs(selectedTag) : this.blogManager.blogs;

    this.blogList.innerHTML = blogs
      .map(
        (blog) => `
    <div class="blog-post">
      <h2 class="blog-title">${blog.title}</h2>
      <div class="blog-date">อัพเดทเมื่อ: ${blog.getFormattedDate()}</div>
      <div class="blog-content">${blog.content.replace(/\n/g, "<br>")}</div>
      <div class="blog-tags">แท็ก: ${blog.tags.join(", ")}</div>
      <div class="blog-actions">
        <button class="btn-edit" onclick="blogUI.editBlog(${blog.id})">แก้ไข</button>
        <button class="btn-delete" onclick="blogUI.deleteBlog(${blog.id})">ลบ</button>
      </div>
    </div>
    `
      )
      .join("");

    this.updateTagFilter();
  }

  updateTagFilter() {
    let allTags = new Set();
    this.blogManager.blogs.forEach((blog) => {
      blog.tags.forEach((tag) => allTags.add(tag));
    });

    this.tagFilter.innerHTML = '<option value="">-- เลือกแท็ก --</option>';
    allTags.forEach((tag) => {
      this.tagFilter.innerHTML += `<option value="${tag}">${tag}</option>`;
    });
  }
}

// สร้าง instance และเริ่มต้นใช้งาน
const blogManager = new BlogManager();
const blogUI = new BlogUI(blogManager);
