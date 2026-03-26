import { ref, onValue, push, set } from "firebase/database";
import { database } from "./firebase"; // Ensure your firebase config exports 'rtdb'

export interface BlogPost {
  id?: string;
  type: string;
  title: string;
  date: string;
  description: string;
  category: "Tech" | "Healthcare" | "Clinical";
}

// Function to fetch blogs in real-time
export const subscribeToBlogs = (callback: (blogs: BlogPost[]) => void) => {
  const blogRef = ref(database, 'blogs');
  return onValue(blogRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const blogList = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
      callback(blogList.reverse()); // Newest first
    } else {
      callback([]);
    }
  });
};