import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export const NotFoundPage = () => (
  <div className="flex min-h-[70vh] items-center justify-center">
    <div className="w-full max-w-md">
      <Card title="Page not found" description="The page you are trying to access does not exist.">
        <Link to="/">
          <Button>Go to Dashboard</Button>
        </Link>
      </Card>
    </div>
  </div>
);

