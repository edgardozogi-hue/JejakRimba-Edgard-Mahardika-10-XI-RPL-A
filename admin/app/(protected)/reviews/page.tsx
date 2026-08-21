import { listReviews } from "@/actions/admin";
import ReviewsClient from "../../components/ReviewsClient";

export default async function ReviewsPage() {
  const { reviews, error } = await listReviews();
  return <ReviewsClient reviews={reviews} error={error} />;
}
