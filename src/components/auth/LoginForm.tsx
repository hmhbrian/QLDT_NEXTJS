
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useError } from "@/hooks/use-error";
import { LoadingButton } from "@/components/ui/loading";
import { useAuth } from "@/hooks/useAuth";

const formSchema = z.object({
  email: z
    .string()
    .email("Email không hợp lệ")
    .regex(/@becamex\.com$/, "Email phải có domain @becamex.com"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { showError } = useError();
  const { login } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      await login({ email: values.email, password: values.password }); // Pass the whole values object
    } catch (error) {
      showError("AUTH001");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="abc@becamex.com"
                  className="h-12 rounded-lg border-border/50 bg-background/50 px-4 text-base transition-all focus:ring-1 focus:ring-primary"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Mật khẩu</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mật khẩu"
                    className="h-12 rounded-lg border-border/50 bg-background/50 px-4 pr-12 text-base transition-all focus:ring-1 focus:ring-primary"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton
          type="submit"
          className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-medium text-base shadow-lg hover:bg-primary/90 transition-all duration-200"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Đăng nhập
        </LoadingButton>
      </form>
    </Form>
  );
}
