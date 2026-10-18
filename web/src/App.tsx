import { Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import HostPage from "./pages/HostPage";
import BookPage from "./pages/BookPage";
import ConfirmationPage from "./pages/ConfirmationPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/host" element={<HostPage />} />
      <Route path="/book" element={<BookPage />} />
      <Route path="/confirmed" element={<ConfirmationPage />} />
    </Routes>
  );
}