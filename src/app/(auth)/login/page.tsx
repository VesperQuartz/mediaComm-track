"use client";

import Form from "next/form";
import { useActionState } from "react";
import { signUp } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Auth = () => {
  const [_state, action, pending] = useActionState(signUp, undefined);
  return (
    <div>
      <Form action={action}>
        <div className="m-10 flex w-fit flex-col gap-3">
          <Input name="email" placeholder="email" type="email" />
          <Input name="password" placeholder="password" type="password" />
          <Button type="submit">{pending ? "Submiting..." : "Signup"}</Button>
        </div>
      </Form>
    </div>
  );
};

export default Auth;
