class BlogDTO {
  constructor(blog) {
    this.title = blog.title;
    this.content = blog.content;
    this.photo = blog.photopath;
    this.author = blog.author;
  }
}
export default BlogDTO;
