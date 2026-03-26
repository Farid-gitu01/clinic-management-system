import { ref, push, set } from "firebase/database";
import { database } from "./firebase";
import { BlogPost } from "./blog-service";

export const addBlogPost = async (post: Omit<BlogPost, 'id'>) => {
  try {
    const blogRef = ref(database, 'blogs');
    const newPostRef = push(blogRef);
    await set(newPostRef, {
      ...post,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    });
    return { success: true };
  } catch (error) {
    console.error("Error adding blog:", error);
    return { success: false, error };
  }
};