import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

const Landing = () => {
  const features = [
    {
      title: "Set Once, Runs Forever",
      description:
        "Configure your subscription payment once and let blockchain automation handle the rest.",
      icon: "⚡",
    },
    {
      title: "No More Missed Payments",
      description:
        "Smart contracts ensure your subscriptions are always paid on time, every time.",
      icon: "🎯",
    },
    {
      title: "Complete Control",
      description:
        "Pause, modify, or cancel your subscriptions instantly with just one click.",
      icon: "🔧",
    },
    {
      title: "Truly Decentralized",
      description:
        "Your payments run autonomously without relying on centralized infrastructure.",
      icon: "🌐",
    },
  ];

  const stats = [
    { label: "Active Subscriptions", value: "10,000+" },
    { label: "Total Value Locked", value: "$2.5M" },
    { label: "Success Rate", value: "99.9%" },
    { label: "Services Supported", value: "50+" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden  pt-40 pb-16">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl space-y-6">
            <h1 className="text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Web3{" "}
              <span className=" text-transparent bg-clip-text bg-gradient-to-bl from-primary to-blue-500">
                Subscriptions
              </span>{" "}
              <span className="text-foreground/50 font-normal">for</span> <br />
              <span className="">
                Users <span className="text-foreground/50 font-normal">&</span>{" "}
                Creators
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-xl text-muted-foreground leading-relaxed">
              Subscribe to your favorite services or earn by creating autonomous
              plans. All trustless. All on-chain.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Link href="/home">
                <Button variant="default" size="lg" className="min-w-[200px]">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose Autonomous Subscriptions?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the next generation of subscription management with
              smart contract automation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover-lift">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Whether you&apos;re a Provider or a Consumer — SubZero has you covered.
            </h2>
            <p className="text-lg text-primary-foreground/80">
              Power your recurring payments with unstoppable smart contracts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Link href="/home">
                <Button variant="default" size="lg" className="min-w-[180px]">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
