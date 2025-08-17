"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoadingButton } from "@/components/ui/loading";
import { useAuth } from "@/hooks/useAuth";
import { extractErrorMessage } from "@/lib/core";

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
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { login, loadingAuth } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isLoading || loadingAuth) return;

    try {
      setIsLoading(true);
      setErrorMessage(""); // Clear previous errors
      
      await login(
        { email: values.email, password: values.password },
        rememberMe
      );
      // Login successful - useAuth will handle success toast and navigation
    } catch (error) {
      // Extract and display specific error message
      const errorMsg = extractErrorMessage(error);
      setErrorMessage(errorMsg);
      
      // Also show toast for better UX (useAuth already handles this but let's be sure)
      console.error("Login error:", error);
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

        {/* Remember Me Checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="rememberMe"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
          />
          <label
            htmlFor="rememberMe"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Ghi nhớ đăng nhập
          </label>
        </div>

        <LoadingButton
          type="submit"
          className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-medium text-base shadow-lg hover:bg-primary/90 transition-all duration-200"
          isLoading={isLoading || loadingAuth}
          disabled={isLoading || loadingAuth}
        >
          Đăng nhập
        </LoadingButton>
      </form>
    </Form>
  );
}
