import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { MESSAGES } from "@/constants/messages";
import { notifier } from "@/utils/notifier";
import { z } from "zod";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useUploadAvatarMutation,
} from "@/store/api/userApiSlice";

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
  const {
    data: profile,
    isLoading: isFetching,
    refetch: loadProfile,
  } = useGetProfileQuery(undefined, {
    skip: !token,
  });

  const [updateProfileMutation, { isLoading: isUpdating }] =
    useUpdateProfileMutation();
  const [changePasswordMutation, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();
  const [uploadAvatarMutation, { isLoading: isUploadingAvatar }] =
    useUploadAvatarMutation();

  // Profile State (local copy for editing)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Synchronize local state with fetched profile
  useEffect(() => {
    if (profile) {
      setEmail(profile.email || "");
      setFirstName(profile.firstName || "");
      setLastName(profile.lastName || "");
      setOrganizationName(profile.organizationName || "");
      setProfileImage(profile.avatar || null);
    }
  }, [profile]);

  // Password State
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const loading =
    isFetching || isUpdating || isChangingPassword || isUploadingAvatar;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const computedName = useMemo(() => {
    return `${firstName} ${lastName}`.trim() || email.split("@")[0] || "User";
  }, [firstName, lastName, email]);

  const computedInitial = useMemo(
    () => (computedName?.[0] || email?.[0] || "U").toUpperCase(),
    [computedName, email],
  );

  const updateProfile = useCallback(async () => {
    const parsed = profileUpdateSchema.safeParse({ firstName, lastName });
    if (!parsed.success) {
      notifier.error(
        null,
        parsed.error.errors[0]?.message || MESSAGES.VALIDATION.INVALID_INPUT,
      );
      return false;
    }

    try {
      await updateProfileMutation({
        firstName,
        lastName,
        avatar: profileImage,
      }).unwrap();
      notifier.success(MESSAGES.AUTH.PROFILE_UPDATE_SUCCESS);
      return true;
    } catch (err) {
      notifier.error(err, "Failed to update profile");
      return false;
    }
  }, [firstName, lastName, profileImage, updateProfileMutation]);

  const changePassword = useCallback(async () => {
    const payload = {
      currentPassword: passwords.current,
      newPassword: passwords.new,
      confirmNewPassword: passwords.confirm,
    };

    const parsed = passwordChangeSchema.safeParse(payload);
    if (!parsed.success) {
      notifier.error(
        null,
        parsed.error.errors[0]?.message || MESSAGES.VALIDATION.INVALID_INPUT,
      );
      return false;
    }

    try {
      await changePasswordMutation(payload).unwrap();
      notifier.success(MESSAGES.AUTH.PASSWORD_UPDATE_SUCCESS);
      setPasswords({ current: "", new: "", confirm: "" });
      return true;
    } catch (err) {
      notifier.error(err, "Failed to change password");
      return false;
    }
  }, [passwords, changePasswordMutation]);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        notifier.error(null, MESSAGES.VALIDATION.FILE_SIZE_ERROR);
        return;
      }

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "profiles");

        const res = await uploadAvatarMutation(formData).unwrap();

        if (res?.url) {
          setProfileImage(res.url);
          notifier.success(MESSAGES.AUTH.IMAGE_UPLOAD_SUCCESS);
        }
      } catch (err) {
        notifier.error(err, "Failed to upload image");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [uploadAvatarMutation],
  );

  const removeImage = useCallback(() => {
    setProfileImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  return useMemo(
    () => ({
      state: {
        firstName,
        lastName,
        email,
        organizationName,
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
    }),
    [
      firstName,
      lastName,
      email,
      organizationName,
      profileImage,
      passwords,
      loading,
      computedName,
      computedInitial,
      loadProfile,
      updateProfile,
      changePassword,
      handleImageUpload,
      removeImage,
    ],
  );
}
