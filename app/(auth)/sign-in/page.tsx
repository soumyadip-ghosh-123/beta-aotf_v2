"use client";

import React from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { Form } from "@heroui/form";
import { Divider } from "@heroui/divider";
import { Card, CardBody } from "@heroui/card";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const [isVisible, setIsVisible] = React.useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("login submit");
  };

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="rounded-large flex w-full max-w-sm flex-col gap-4">
        <Card className="max-w-full">
          <CardBody className="overflow-hidden">
            <h1 className="text-xl font-bold mb-4">Login</h1>

            <Form
              className="flex flex-col gap-3"
              validationBehavior="native"
              onSubmit={handleSubmit}
            >
              <Input
                isRequired
                label="Email Address"
                name="email"
                placeholder="Enter your email"
                type="email"
                variant="bordered"
              />
              <Input
                isRequired
                endContent={
                  <button type="button" onClick={toggleVisibility}>
                    {isVisible ? (
                      <FaEyeSlash className="text-default-400 pointer-events-none text-2xl" />
                    ) : (
                      <FaEye className="text-default-400 pointer-events-none text-2xl" />
                    )}
                  </button>
                }
                label="Password"
                name="password"
                placeholder="Enter your password"
                type={isVisible ? "text" : "password"}
                variant="bordered"
              />
              <Link className="text-default-500" href="#" size="sm">
                Forgot password?
              </Link>
              <Button className="w-full" color="primary" type="submit">
                Log in
              </Button>
            </Form>

            <div className="flex items-center gap-4 py-2">
              <Divider className="flex-1" />
              <p className="text-tiny text-default-500 shrink-0">OR</p>
              <Divider className="flex-1" />
            </div>
            <div className="flex flex-col gap-2">
              <Button
                startContent={
                  <FcGoogle className="text-default-500" width={24} />
                }
                variant="bordered"
              >
                Continue with Google
              </Button>
            </div>
            <p className="text-small text-center mt-2">
              Need to create an account?&nbsp;
              <Link href="/sign-up" size="sm">
                Sign up
              </Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
