import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Schedule from "@/pages/Schedule";
import TreatmentConfirm from "@/pages/TreatmentConfirm";
import VoucherVerify from "@/pages/VoucherVerify";
import ConsumableCheck from "@/pages/ConsumableCheck";
import PostOp from "@/pages/PostOp";
import ExceptionReport from "@/pages/ExceptionReport";
import ExceptionList from "@/pages/ExceptionList";
import UnverifiedList from "@/pages/UnverifiedList";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Schedule />} />
          <Route path="/patient/:id/confirm" element={<TreatmentConfirm />} />
          <Route path="/patient/:id/voucher" element={<VoucherVerify />} />
          <Route path="/patient/:id/consumable" element={<ConsumableCheck />} />
          <Route path="/patient/:id/post-op" element={<PostOp />} />
          <Route path="/patient/:id/exception" element={<ExceptionReport />} />
          <Route path="/exceptions" element={<ExceptionList />} />
          <Route path="/unverified" element={<UnverifiedList />} />
        </Route>
      </Routes>
    </Router>
  );
}
