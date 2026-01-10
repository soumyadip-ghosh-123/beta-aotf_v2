"use client";

import React from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Checkbox } from "@heroui/checkbox";
import { Link } from "@heroui/link";
import { Form } from "@heroui/form";
import { Divider } from "@heroui/divider";
import { Card, CardBody } from "@heroui/card";
import { Tabs, Tab } from "@heroui/tabs";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

export default function Auth() {
  const [isVisible, setIsVisible] = React.useState(false);
  const [selected, setSelected] = React.useState("login");
  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("handleSubmit");
  };

  return (
    <div className="flex h-full min-w-90 items-center justify-center">
      <div className="rounded-large flex w-full max-w-sm flex-col gap-4">
        <Card className="max-w-full">
          <CardBody className="overflow-hidden">
            <Tabs
              fullWidth
              aria-label="Tabs form"
              selectedKey={selected}
              size="md"
              key={selected}
              onSelectionChange={(key) => setSelected(key as string)}
            >
              <Tab key="login" title="Login">
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
                  <div className="flex w-full items-center justify-between px-1 py-2"></div>
                  <Link className="text-default-500" href="#" size="sm">
                    Forgot password?
                  </Link>
                  <Button className="w-full" color="primary" type="submit">
                    Log In
                  </Button>
                </Form>
              </Tab>
              <Tab key="sign-up" title="Sign up">
                <Form
                  className="flex flex-col gap-3"
                  validationBehavior="native"
                  onSubmit={handleSubmit}
                >
                  <Input
                    isRequired
                    label="Full Name"
                    name="name"
                    placeholder="Enter your full name"
                    type="text"
                    variant="bordered"
                  />
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
                    placeholder="Create a password"
                    type={isVisible ? "text" : "password"}
                    variant="bordered"
                  />
                  {/* confirm password */}
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
                    label="Confirm Password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    type={isVisible ? "text" : "password"}
                    variant="bordered"
                  />
                  <Checkbox isRequired className="py-4" size="sm">
                    I agree with the&nbsp;
                    <Link className="relative z-1" href="#" size="sm">
                      Terms
                    </Link>
                    &nbsp; and&nbsp;
                    <Link className="relative z-1" href="#" size="sm">
                      Privacy Policy
                    </Link>
                  </Checkbox>
                  <Button className="w-full" color="primary" type="submit">
                    Create Account
                  </Button>
                </Form>
              </Tab>
            </Tabs>

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
              {selected === "login" ? (
                <>
                  Need to create an account?&nbsp;
                  <Link
                    href="#"
                    size="sm"
                    onClick={() => {
                      setSelected("sign-up");
                    }}
                  >
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?&nbsp;
                  <Link
                    href="#"
                    size="sm"
                    onClick={() => {
                      setSelected("login");
                    }}
                  >
                    Login
                  </Link>
                </>
              )}
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
