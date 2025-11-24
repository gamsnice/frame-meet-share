import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AccountSettings({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    organization_name: "",
    email: "",
  });

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      if (data) {
        setFormData({
          name: data.name || "",
          organization_name: data.organization_name || "",
          email: data.email || "",
        });
      }
    } catch (error: any) {
      toast.error("Failed to load profile");
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("users")
        .update({
          name: formData.name,
          organization_name: formData.organization_name,
        })
        .eq("id", userId);

      if (error) throw error;
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="organization">Organization</Label>
            <Input
              id="organization"
              value={formData.organization_name}
              onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Email cannot be changed
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
