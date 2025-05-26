import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = "https://bdhbygxtbajapwqorkvb.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkaGJ5Z3h0YmFqYXB3cW9ya3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyMDA5NDEsImV4cCI6MjA2MDc3Njk0MX0.-Yt2sZACGH9jyGLIVzOHcdSn4S6rYT-IsQ8sP7QM6Ek";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
