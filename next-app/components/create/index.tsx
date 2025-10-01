"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBearby } from "@/hooks/useBearby";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { callCreatePlan } from "@/lib/massa/callCreatePlan";

const CreatePlan = () => {
  const { connected, address } = useBearby();
  const router = useRouter();
  const [shareableLink, setShareableLink] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    planId: "",
    planName: "",
    description: "",
    token: "",
    amount: "",
    frequency: "",
  });

  const tokens = [{ value: "MAS", label: "MAS", icon: "" }];

  const frequencies = [
    { label: "Weekly (7 days)", value: "weekly" },
    { label: "Monthly (30 days)", value: "monthly" },
    { label: "Quarterly (90 days)", value: "quarterly" },
    { label: "Yearly (365 days)", value: "yearly" },
  ];
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const planId = "plan-" + Math.random().toString(36).substring(2, 10);

    const createdAt = new Date().toISOString();
    setIsLoading(true);
    try {
      const opId = await callCreatePlan({
        planId,
        planName: formData.planName,
        description: formData.description,
        token: formData.token,
        amount: formData.amount,
        frequency: formData.frequency,
        createdAt,
      });

      const planURL = `${window.location.origin}/subscribe?creator=${address}&planId=${planId}`;
      setShareableLink(planURL);

      toast.success("Plan Created Successfully! 🎉", {
        description: `Tx ID: ${opId}`,
      });
    } catch (err: unknown) {
      console.error(err);

      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";

      toast.error("Failed to create plan on-chain", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    formData.planName &&
    formData.description &&
    formData.token &&
    formData.amount &&
    formData.frequency;

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto  max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Create Subscription Plan
          </h1>
          <p className="text-muted-foreground">
            Set up recurring crypto payments for your content or services
          </p>
        </div>

        {/* Form */}
        {!shareableLink && (
          <>
            <Card className="">
              <CardHeader>
                <CardTitle>Plan Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Plan Name */}
                  <div className="space-y-2">
                    <Label htmlFor="planName">Plan Name</Label>
                    <Input
                      id="planName"
                      placeholder="Premium Access"
                      value={formData.planName}
                      onChange={(e) =>
                        setFormData({ ...formData, planName: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Private group, early drops, bonus content"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  {/* Token Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="token">Token</Label>
                    <Select
                      value={formData.token}
                      onValueChange={(value) =>
                        setFormData({ ...formData, token: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select token" />
                      </SelectTrigger>
                      <SelectContent>
                        {tokens.map((token) => (
                          <SelectItem key={token.value} value={token.value}>
                            <div className="flex items-center space-x-2">
                              <span>{token.icon}</span>
                              <span>{token.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Amount and Frequency */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="5.00"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData({ ...formData, amount: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select
                        value={formData.frequency}
                        onValueChange={(value) =>
                          setFormData({ ...formData, frequency: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          {frequencies.map((freq) => (
                            <SelectItem key={freq.value} value={freq.value}>
                              {freq.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Preview */}
                  {isFormValid && (
                    <Card className="border  bg-background">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground mb-2">
                          Plan Preview
                        </h3>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="text-muted-foreground hidden">
                              Plan ID:
                            </span>{" "}
                            {formData.planId}
                          </p>
                          <p>
                            <span className="text-muted-foreground">Name:</span>{" "}
                            {formData.planName}
                          </p>
                          <p>
                            <span className="text-muted-foreground">
                              Price:
                            </span>{" "}
                            {formData.amount} {formData.token}
                          </p>
                          <p>
                            <span className="text-muted-foreground">
                              Billing:
                            </span>{" "}
                            {formData.frequency}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="default"
                    size="lg"
                    className="w-full"
                    disabled={!isFormValid || isLoading}
                  >
                    {isLoading
                      ? "Creating Plan..."
                      : "Create Plan & Deploy Smart Contract"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border border-border bg-muted/30 mt-6">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">
                  What happens next?
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Smart contract will be deployed on Massa Network</li>
                  <li>
                    • You&apos;ll get a shareable link to promote your plan
                  </li>
                  <li>• Subscribers can pay with one click</li>
                  <li>
                    • Payments are automatically processed every billing cycle
                  </li>
                  <li>• You can pause or cancel the plan anytime</li>
                </ul>
              </CardContent>
            </Card>
          </>
        )}
        {/* Shareable Link Card */}
        {shareableLink && (
          <Card className="mt-6 border-green-400">
            <CardHeader>
              <CardTitle className="text-green-600">🎉 Plan Created</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your plan is live! Share this link with your audience:
              </p>
              <div className="flex items-center space-x-2">
                <Input readOnly value={shareableLink} className="flex-1" />
                <Button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(shareableLink);
                    toast.success("Link copied to clipboard");
                  }}
                >
                  Copy
                </Button>
              </div>
              <Button
                onClick={() => router.push("/dashboard")}
                variant="outline"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CreatePlan;
