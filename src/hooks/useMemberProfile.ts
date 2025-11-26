import { useState, useCallback, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import { getFriendlyError } from "@/utils/errors";
import api, { API_ROUTES } from "@/utils/api";
import { AppDispatch } from "@/store/store";
import { useDispatch } from "react-redux";
import { fetchProfile } from "@/features/auth/authSlice";

// Define schemas outside component for performance
const profileUpdateSchema = z.object({
  firstName: z.string().min(2, "First name too short"),
  lastName: z.string().min(2, "Last name too short"),
});

const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password required"),
    newPassword: z.string().min(8, "New password must be 8+ chars"),
    confirmNewPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  });

export function useMemberProfile(token: string | null) {
  const dispatch = useDispatch<AppDispatch>();
  // Profile State (local copy for editing)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Password State
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const computedName = useMemo(() => {
    return `${firstName} ${lastName}`.trim() || email.split("@")[0] || "User";
  }, [firstName, lastName, email]);

  const computedInitial = useMemo(
    () => (computedName?.[0] || email?.[0] || "U").toUpperCase(),
    [computedName, email],
  );

  const loadProfile = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      // GET /api/user/profile
      const res = await api.get(API_ROUTES.USER.PROFILE);
      const d = res.data?.data || {};
      setEmail(d.email || "");
      setFirstName(d.firstName || "");
      setLastName(d.lastName || "");
      setProfileImage(d.avatar || null);
    } catch (err) {
      toast.error(getFriendlyError(err, "Failed to load profile"));
    } finally {
      setLoading(false);
    }
  }, [token]);

  const updateProfile = async () => {
    const parsed = profileUpdateSchema.safeParse({ firstName, lastName });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message || "Invalid input");
      return false;
    }

    try {
      setLoading(true);
      // PUT /api/user/profile
      await api.put(API_ROUTES.USER.PROFILE, {
        firstName,
        lastName,
        avatar: profileImage,
      });
      toast.success("Profile updated");
      dispatch(fetchProfile());
      return true;
    } catch (err) {
      toast.error(getFriendlyError(err, "Failed to update profile"));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    const payload = {
      currentPassword: passwords.current,
      newPassword: passwords.new,
      confirmNewPassword: passwords.confirm,
    };

    const parsed = passwordChangeSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message || "Invalid password input");
      return false;
    }

    try {
      setLoading(true);
      // POST /api/user/change-password
      await api.post(API_ROUTES.USER.CHANGE_PASSWORD, payload);
      toast.success("Password updated successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
      return true;
    } catch (err) {
      toast.error(getFriendlyError(err, "Failed to change password"));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setProfileImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setProfileImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return {
    state: {
      firstName,
      lastName,
      email,
      profileImage,
      passwords,
      loading,
      computedName,
      computedInitial,
    },
    setters: { setFirstName, setLastName, setPasswords },
    actions: {
      loadProfile,
      updateProfile,
      changePassword,
      handleImageUpload,
      removeImage,
      triggerFileInput: () => fileInputRef.current?.click(),
    },
    refs: { fileInputRef },
  };
}
