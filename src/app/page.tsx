import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">Welcome to Auth App</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-8">
            <p className="text-muted-foreground">
              A secure authentication system with profile management and social login options.
            </p>
          </div>
          <div className="space-y-4">
            <Link href="/signin" className="w-full block">
              <Button className="w-full" size="lg">
                Sign In
              </Button>
            </Link>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  or
                </span>
              </div>
            </div>
            <Link href="/signup" className="w-full block">
              <Button variant="outline" className="w-full" size="lg">
                Create Account
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

