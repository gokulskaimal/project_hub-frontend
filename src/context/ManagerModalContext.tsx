import React, { createContext, useContext, useState } from "react";

interface ManagerModalContextType {
  openInviteModal: () => void;
  closeInviteModal: () => void;
  isInviteModalOpen: boolean;

  openCreateProjectModal: () => void;
  closeCreateProjectModal: () => void;
  isCreateProjectModalOpen: boolean;
}

const ManagerModalContext = createContext<ManagerModalContextType | undefined>(
  undefined,
);

export const ManagerModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState(false);

  const openInviteModal = () => setIsInviteModalOpen(true);
  const closeInviteModal = () => setIsInviteModalOpen(false);

  const openCreateProjectModal = () => setIsCreateProjectModalOpen(true);
  const closeCreateProjectModal = () => setIsCreateProjectModalOpen(false);

  return (
    <ManagerModalContext.Provider
      value={{
        openInviteModal,
        closeInviteModal,
        isInviteModalOpen,
        openCreateProjectModal,
        closeCreateProjectModal,
        isCreateProjectModalOpen,
      }}
    >
      {children}
    </ManagerModalContext.Provider>
  );
};

export const useManagerModals = () => {
  const context = useContext(ManagerModalContext);
  if (context === undefined) {
    throw new Error(
      "useManagerModals must be used within a ManagerModalProvider",
    );
  }
  return context;
};
