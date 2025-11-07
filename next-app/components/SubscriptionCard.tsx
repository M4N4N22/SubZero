import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SubscriptionCardProps {
  service: string;
  amount: string;
  frequency: string;
  nextPayment: string;
  status: "active" | "paused" | "cancelled";
  icon?: React.ReactNode;
}

const SubscriptionCard = ({
  service,
  amount,
  frequency,
  nextPayment,
  status,
  icon,
}: SubscriptionCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-200 text-foreground";
      case "paused":
        return "bg-premium text-premium-foreground";
      case "cancelled":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className=" border border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
              {icon}
            </div>
          )}
          <div>
            <CardTitle className="text-base font-semibold">{service}</CardTitle>
            <p className="text-sm text-muted-foreground">{frequency}</p>
          </div>
        </div>
        <Badge className={getStatusColor(status)} variant="secondary">
          {status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Amount
            </p>
            <p className="text-lg font-bold text-foreground">{amount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Next Payment
            </p>
            <p className="text-sm font-medium text-foreground">
              {new Date(nextPayment).toLocaleDateString("en-GB", {
                timeZone: "UTC",
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => {
              toast.info("This feature is in development");
            }}
            variant="outline"
            size="sm"
            className="w-fit bg-red-600 hover:bg-red-500 text-white"
          >
            Cancel Subscription
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionCard;
