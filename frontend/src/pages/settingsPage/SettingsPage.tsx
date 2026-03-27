import { useEffect, useState } from "react";
import { User, Mail, LogOut, Save } from "lucide-react";
import {
  changePassword,
  changeProfile,
  getMe,
} from "../../api/user";
import { useAuth } from "../../auth/AuthContext";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { logout } = useAuth();

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  // const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  useEffect(() => {
    getMe().then((userData) => {
      setProfile(userData); // getMe already returns res.data.user
    });
  }, []);

  // const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     setSelectedFile(file);
  //     const url = URL.createObjectURL(file);
  //     setPreviewUrl(url);
  //   }
  // };

  // const triggerFileInput = () => {
  //   document.getElementById("avatar-upload")?.click();
  // };

  if (!profile)
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary"></div>
      </div>
    );

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);

      // Update profile info - pass both name and bio
      await changeProfile(profile.name, profile.bio || "");

      // // Update avatar if a new file was selected
      // if (selectedFile) {
      //   const formData = new FormData();
      //   formData.append("file", selectedFile);
      //   await changeAvatar(formData);
      // }

      // Refresh profile data
      const updatedUser = await getMe();
      setProfile(updatedUser);
      // setSelectedFile(null);
      setPreviewUrl(null);

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      return toast.error("New passwords do not match");
    }

    if (passwordData.new.length < 8) {
      return toast.error("Password must be at least 8 characters long");
    }

    try {
      setSavingPassword(true);
      
      // Pass both old and new password
      await changePassword(passwordData.current, passwordData.new);
      
      toast.success("Password changed successfully!");

      // Clear password fields
      setPasswordData({
        current: "",
        new: "",
        confirm: "",
      });
    } catch (error: any) {
      console.error("Password change failed:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your personal information and security</p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="rounded-2xl bg-card p-6 shadow-xl border border-border">
            <div className="space-y-6">
              <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                <User size={20} className="text-primary" />
                Personal Information
              </h2>

              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={
                      previewUrl ||
                      profile.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${profile.name}&size=128&background=3b82f6&color=fff`
                    }
                    alt="Avatar"
                    className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/20"
                  />
                  {/* <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={triggerFileInput}
                    className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-blue-600 p-2 text-white shadow-lg transition hover:bg-blue-700"
                  >
                    <Camera size={16} />
                  </button> */}
                </div>
                {/* <div>
                  <p className="text-sm font-medium text-gray-700">
                    Profile picture
                  </p>
                  <p className="text-xs text-gray-400">JPG, PNG...</p>
                  {selectedFile && (
                    <p className="mt-1 text-xs text-green-600">
                      New image selected
                    </p>
                  )}
                </div> */}
              </div>

              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Display Name
                </label>
                <input
                  type="text"
                  value={profile.name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-foreground transition focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="Your name"
                />
              </div>

              {/* Email - Read only */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/60" />
                  <input
                    type="email"
                    value={profile.email || ""}
                    readOnly
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-border bg-secondary/30 py-3 pl-10 pr-4 text-muted-foreground"
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground/60 italic">
                  Email cannot be changed
                </p>
              </div>

              {/* Bio */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Bio
                </label>
                <textarea
                  rows={4}
                  value={profile.bio || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-foreground transition focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="Tell us about yourself..."
                />
                <p className="mt-2 text-xs text-muted-foreground/60">
                  Brief description for your profile. Max 160 characters.
                </p>
              </div>
            </div>
            <div className="mt-6 flex">
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/30 shadow-lg shadow-primary/20 hover:-translate-y-0.5"
              >
                <Save size={18} />
                {savingProfile ? "Saving..." : "Save Profile Changes"}
              </button>
            </div>
          </div>

          {/* Password Card */}
          <div className="rounded-2xl bg-card p-6 shadow-xl border border-border">
            <h2 className="mb-6 text-xl font-bold text-foreground">Change Password</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.current}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      current: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-foreground transition focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, new: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-foreground transition focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirm: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-foreground transition focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
 
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long
              </p>
            </div>
            <div className="mt-6 flex">
              <button
                onClick={handleSavePassword}
                disabled={savingPassword}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/30 shadow-lg shadow-primary/20 hover:-translate-y-0.5"
              >
                <Save size={18} />
                {savingPassword ? "Updating..." : "Change Password"}
              </button>
            </div>
          </div>

          {/* Logout Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleLogout}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-destructive/10 px-10 py-3.5 text-sm font-bold text-destructive transition hover:bg-destructive/20 border border-destructive/20"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}