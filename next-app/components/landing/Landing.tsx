import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Brain,
  Zap,
  Star,
  Database,
  Lock,
  Network,
  Binary,
  HardDrive,
  ServerCog,
} from "lucide-react";

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
      <div className="absolute inset-0 bg-gradient-to-b from-primary/90 via-background  dark:from-primary/50 dark:via-primary/30 dark:to-primary/50"></div>

      <div className="absolute inset-0 overflow-hidden opacity-10 z-0">
        <Database
          className="absolute w-8 h-8 text-white top-20 left-[10%] animate-pulse"
          style={{ animationDelay: "0s", animationDuration: "3s" }}
        />
        <ServerCog
          className="absolute w-10 h-10 text-white top-40 right-[15%] animate-pulse"
          style={{ animationDelay: "0.5s", animationDuration: "4s" }}
        />
        <Lock
          className="absolute w-6 h-6 text-white bottom-32 left-[20%] animate-pulse"
          style={{ animationDelay: "1s", animationDuration: "3.5s" }}
        />
        <Database
          className="absolute w-12 h-12 text-white top-[60%] right-[25%] animate-pulse"
          style={{ animationDelay: "1.5s", animationDuration: "4.5s" }}
        />
        <HardDrive
          className="absolute w-7 h-7 text-white bottom-[20%] right-[10%] animate-pulse"
          style={{ animationDelay: "2s", animationDuration: "3s" }}
        />
        <ServerCog
          className="absolute w-9 h-9 text-white top-[30%] left-[5%] animate-pulse"
          style={{ animationDelay: "2.5s", animationDuration: "5s" }}
        />
        <Database
          className="absolute w-6 h-6 text-white bottom-40 right-[30%] animate-pulse"
          style={{ animationDelay: "3s", animationDuration: "3.5s" }}
        />
        <ServerCog
          className="absolute w-8 h-8 text-white top-[50%] left-[30%] animate-pulse"
          style={{ animationDelay: "3.5s", animationDuration: "4s" }}
        />
      </div>

      <div className="absolute inset-0 backdrop-blur-3xl dark:bg-white/5 bg-black/5"></div>

      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div
          className="absolute w-2 h-2 bg-white rounded-full top-[15%] left-[12%] animate-ping"
          style={{ animationDuration: "2s" }}
        ></div>
        <div
          className="absolute w-3 h-3 bg-white rounded-full top-[25%] right-[18%] animate-ping"
          style={{ animationDuration: "3s", animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute w-2 h-2 bg-white rounded-full bottom-[30%] left-[8%] animate-ping"
          style={{ animationDuration: "2.5s", animationDelay: "1s" }}
        ></div>
        <div
          className="absolute w-3 h-3 bg-white rounded-full top-[70%] right-[12%] animate-ping"
          style={{ animationDuration: "3.5s", animationDelay: "1.5s" }}
        ></div>
        <div
          className="absolute w-2 h-2 bg-white rounded-full top-[45%] left-[15%] animate-ping"
          style={{ animationDuration: "2s", animationDelay: "2s" }}
        ></div>
        <div
          className="absolute w-3 h-3 bg-white rounded-full bottom-[45%] right-[20%] animate-ping"
          style={{ animationDuration: "3s", animationDelay: "2.5s" }}
        ></div>
      </div>

      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      ></div>

      {/* Hero Section */}
      <section className="relative overflow-hidden  pt-56 pb-16">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto  space-y-6">
            <h1 className="text-5xl font-semibold tracking-tighter text-foreground sm:text-6xl lg:text-8xl">
              Web3{" "}
              <span className=" text-primary">
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center ">
              <Link href="/discover">
                <Button variant="default" size="lg" className="min-w-[300px] p-6 rounded-full text-lg">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-44 bg-background">
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

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-3 w-3/4 mx-auto">
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
      <section className="py-16 bg-card">
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
              Whether you&apos;re a Provider or a Consumer — SubZero has you
              covered.
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
