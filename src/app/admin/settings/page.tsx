"use client";

import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Database,
  Mail,
  Smartphone
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-muted-foreground">Configure your store's global parameters and administrative preferences.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px] mb-8 bg-zinc-100 dark:bg-zinc-900 border-none p-1 rounded-xl">
          <TabsTrigger value="general" className="rounded-lg">General</TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg">Security</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg">Alerts</TabsTrigger>
          <TabsTrigger value="api" className="rounded-lg">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="border-none shadow-md bg-white dark:bg-zinc-900 rounded-2xl p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl flex items-center">
                <SettingsIcon className="mr-2 h-5 w-5 text-blue-600" /> Store Profile
              </CardTitle>
              <CardDescription>Update your public store information and contact details.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store-name">Store Name</Label>
                  <Input id="store-name" placeholder="Ecommerce AI Pro" defaultValue="Ecommerce AI Pro" className="rounded-xl border-zinc-200 dark:border-zinc-800" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input id="support-email" type="email" placeholder="support@ecommerceai.com" defaultValue="admin@ecommerceai.com" className="rounded-xl border-zinc-200 dark:border-zinc-800" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-desc">Store Description</Label>
                <textarea id="store-desc" className="w-full h-24 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm" placeholder="Tell your customers about your store..." defaultValue="The ultimate AI-powered shopping destination." />
              </div>
              <Button className="rounded-xl px-8 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="border-none shadow-md bg-white dark:bg-zinc-900 rounded-2xl p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl flex items-center">
                <Shield className="mr-2 h-5 w-5 text-red-600" /> Security Policies
              </CardTitle>
              <CardDescription>Manage administrative access and authentication requirements.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-6">
              <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl group border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Two-Factor Authentication</p>
                    <p className="text-xs text-muted-foreground">Enable mandatory 2FA for all admin accounts.</p>
                  </div>
                </div>
                <Button variant="outline" className="rounded-xl">Enable</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card className="border-none shadow-md bg-white dark:bg-zinc-900 rounded-2xl p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl flex items-center">
                <Database className="mr-2 h-5 w-5 text-indigo-600" /> Infrastructure Keys
              </CardTitle>
              <CardDescription>Manage external service integrations and API credentials.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Razorpay Public Key</Label>
                  <div className="flex space-x-2">
                    <Input type="password" value="rzp_test_98yhg76t5r4e" className="font-mono rounded-xl border-zinc-200 dark:border-zinc-800" readOnly />
                    <Button variant="outline" className="rounded-xl">Reveal</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
