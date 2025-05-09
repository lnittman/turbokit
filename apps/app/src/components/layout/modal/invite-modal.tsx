"use client";

import React, { useState, useRef, useEffect } from "react";

import { X, Check, Plus, User, UserPlus, Envelope, Gear } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@repo/design/components/ui/button";
import { Input } from "@repo/design/components/ui/input";
import { cn } from "@repo/design/lib/utils";

import { useChatData } from '@/hooks/chat/queries';
import { useProject } from '@/hooks/project/queries';
import { ParticipantRoleEnum, type ParticipantRole } from '@repo/api/schemas/chat';
import { ProjectRoleEnum, type ProjectRole } from '@repo/api/schemas/project';

// Add custom styles to hide scrollbars across browsers
const customStyles = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }

  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemType?: 'chat' | 'project';
}

export function InviteUserModal({ 
  isOpen, 
  onClose, 
  itemId,
  itemType = 'chat'
}: InviteUserModalProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteResults, setInviteResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedRole, setSelectedRole] = useState<ParticipantRole | ProjectRole>(
    itemType === 'chat' ? ParticipantRoleEnum.Enum.PARTICIPANT : ProjectRoleEnum.Enum.COLLABORATOR
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const emailsContainerRef = useRef<HTMLDivElement>(null);
  
  const { chatData } = useChatData(isOpen && itemType === 'chat' ? itemId : null);
  const { data: projectData } = useProject(isOpen && itemType === 'project' ? itemId : null);
  
  const displayTitle = itemType === 'chat' 
    ? (chatData?.title || 'this chat') 
    : (projectData?.name || 'this project');
  const defaultRole = itemType === 'chat' ? ParticipantRoleEnum.Enum.PARTICIPANT : ProjectRoleEnum.Enum.COLLABORATOR;

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setEmails([]);
        setCurrentEmail("");
        setIsInviting(false);
        setInviteResults(null);
        setError(null);
        setSelectedRole(defaultRole);
      }, 300);
      return () => clearTimeout(timer);
    } else {
       setSelectedRole(defaultRole);
    }
  }, [isOpen, itemType, itemId, defaultRole]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (emailsContainerRef.current && emails.length > 0) {
      emailsContainerRef.current.scrollTo({
        left: emailsContainerRef.current.scrollWidth,
        behavior: 'smooth'
      });
    }
  }, [emails]);

  const handleBackdropClick = () => {
    if (!isInviting) {
      onClose();
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentEmail(e.target.value);
    setError(null);
  };

  const addEmail = () => {
    const trimmedEmail = currentEmail.trim();
    
    if (!trimmedEmail) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("please enter a valid email address");
      return;
    }
    
    if (emails.includes(trimmedEmail)) {
      setError("this email has already been added");
      return;
    }
    
    setEmails([...emails, trimmedEmail]);
    setCurrentEmail("");
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmail();
    }
  };

  const removeEmail = (indexToRemove: number) => {
    setEmails(prevEmails => prevEmails.filter((_, index) => index !== indexToRemove));
  };

  const sendInvites = async () => {
    if (emails.length === 0) {
      setError("please add at least one email address");
      return;
    }
    
    try {
      setIsInviting(true);
      setError(null);
      
      const endpoint = itemType === 'project' 
        ? `/api/projects/${itemId}/invite`
        : `/api/chats/${itemId}/invite`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails,
          role: selectedRole
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'failed to send invites');
      }
      
      const data = await response.json();
      setInviteResults(Array.isArray(data.data) ? data.data : []);
      
    } catch (error) {
      console.error("Failed to send invites:", error);
      setError((error as Error).message || "failed to send invites");
    } finally {
      setIsInviting(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isInviting) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isInviting]);

  const permissionOptions = itemType === 'chat' ? [
      {
        value: ParticipantRoleEnum.Enum.VIEWER,
        label: "viewer (can only view)",
        icon: <User weight="duotone" className="h-3.5 w-3.5 text-muted-foreground" />,
        description: "can view messages, but cannot send any"
      },
      {
        value: ParticipantRoleEnum.Enum.PARTICIPANT,
        label: "participant (can chat)",
        icon: <UserPlus weight="duotone" className="h-3.5 w-3.5 text-muted-foreground" />,
        description: "can view and send messages"
      },
      {
        value: ParticipantRoleEnum.Enum.MODERATOR,
        label: "moderator (can invite others)",
        icon: <Gear weight="duotone" className="h-3.5 w-3.5 text-muted-foreground" />,
        description: "can chat and invite other users"
      }
  ] : [
      {
          value: ProjectRoleEnum.Enum.VIEWER,
          label: "viewer (read-only)",
          icon: <User weight="duotone" className="h-3.5 w-3.5 text-muted-foreground" />,
          description: "can view project and chats"
      },
      {
          value: ProjectRoleEnum.Enum.COLLABORATOR,
          label: "collaborator (can edit)",
          icon: <UserPlus weight="duotone" className="h-3.5 w-3.5 text-muted-foreground" />,
          description: "can view, edit, and add chats"
      },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
          <style jsx global>{customStyles}</style>
          
          <motion.div 
            className="fixed inset-0 bg-background/60 backdrop-blur-md" 
            onClick={handleBackdropClick}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          
          <motion.div 
            className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 transform"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 500, 
              damping: 30,
              mass: 0.8
            }}
          >
            <div className="bg-background shadow-lg overflow-hidden border border-border/50 flex flex-col backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-border/50 p-3 relative">
                <h3 className="text-foreground text-sm font-normal">invite users to {itemType}</h3>
                <button 
                  onClick={onClose}
                  className="h-7 w-7 flex items-center justify-center hover:bg-accent/50 transition-colors"
                  disabled={isInviting}
                >
                  <X weight="duotone" className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              
              <div className="p-4">
                <AnimatePresence mode="wait">
                  {inviteResults ? (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-sm text-foreground mb-4">
                        {inviteResults.length} {inviteResults.length === 1 ? 'invitation' : 'invitations'} sent.
                      </p>
                      
                      <div className="max-h-60 overflow-y-auto mb-4">
                        {inviteResults.map((result, index) => (
                          <motion.div 
                            key={index} 
                            className="flex items-center py-2 border-b border-border/20 last:border-0"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              duration: 0.2,
                              delay: index * 0.05
                            }}
                          >
                            <div className="h-8 w-8 bg-accent/30 flex items-center justify-center mr-3">
                              <Envelope weight="duotone" className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-foreground">{result.email}</p>
                              <p className="text-xs text-muted-foreground">
                                {result.status === 'sent' && 'invitation sent'}
                                {result.status === 'failed' && 'failed to send: ' + (result.error || 'unknown error')}
                                {result.status === 'skipped' && result.message}
                              </p>
                            </div>
                            {result.status === 'sent' && (
                              <Check className="h-5 w-5 text-green-500" weight="duotone" />
                            )}
                          </motion.div>
                        ))}
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="button" 
                          variant="default" 
                          size="sm"
                          onClick={onClose}
                          className="text-xs w-24"
                        >
                          close
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-sm text-foreground mb-4">
                        invite users to collaborate on "<span className="font-medium">{displayTitle}</span>".
                      </p>

                      <div className="mb-4">
                        <label className="text-xs text-muted-foreground mb-2 block">
                          email addresses
                        </label>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="relative flex-1">
                            <Input
                              ref={inputRef}
                              type="email"
                              value={currentEmail}
                              onChange={handleEmailChange}
                              onKeyDown={handleKeyPress}
                              placeholder="enter email address"
                              className="w-full bg-background border-border/50 text-foreground focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
                              disabled={isInviting}
                            />
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="power"
                            onClick={addEmail}
                            disabled={!currentEmail.trim() || isInviting}
                            className="h-9 w-9 p-0 flex items-center justify-center border-border/50 bg-background hover:bg-accent/50 rounded-none"
                          >
                            <Plus weight="duotone" className="h-4 w-4 text-foreground" />
                          </Button>
                        </div>
                        
                        <AnimatePresence>
                          {error && (
                            <motion.p 
                              className="text-xs text-red-500 mb-3"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {error}
                            </motion.p>
                          )}
                        </AnimatePresence>
                        
                        <div className="mb-4 h-14 border border-border/30 bg-accent/10 overflow-hidden">
                          {emails.length > 0 ? (
                            <div 
                              ref={emailsContainerRef}
                              className="flex overflow-x-auto h-full py-2 px-2 gap-2 no-scrollbar"
                              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                              <AnimatePresence>
                                {emails.map((email, index) => (
                                  <motion.div 
                                    key={email} 
                                    className="flex items-center justify-between p-2 bg-accent/20 flex-shrink-0 border border-border/50 group"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="h-6 w-6 bg-accent/30 flex items-center justify-center">
                                        <UserPlus weight="duotone" className="h-3 w-3 text-muted-foreground" />
                                      </div>
                                      <span className="text-sm text-foreground max-w-[140px] truncate">
                                        {email}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeEmail(index)}
                                      disabled={isInviting}
                                      className="ml-2 text-muted-foreground hover:text-foreground transition-colors opacity-70 group-hover:opacity-100"
                                    >
                                      <X weight="duotone" className="h-4 w-4" />
                                    </button>
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <p className="text-xs text-muted-foreground italic">
                                add email addresses to invite users
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mb-6">
                        <label className="text-xs text-muted-foreground mb-2 block">
                          permission level
                        </label>
                        <div className="space-y-2">
                          {permissionOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setSelectedRole(option.value)}
                              className={cn(
                                "w-full flex items-center gap-3 p-2 border transition-colors duration-200",
                                "hover:bg-accent/40 focus:outline-none focus:ring-0",
                                selectedRole === option.value 
                                  ? "bg-accent/30 border-border" 
                                  : "bg-background/60 border-border/40 hover:border-border/80"
                              )}
                            >
                              <div className="h-6 w-6 bg-accent/30 flex-shrink-0 flex items-center justify-center">
                                {option.icon}
                              </div>
                              <div className="flex-1 text-left">
                                <div className="text-sm font-medium text-foreground flex items-center">
                                  {option.label}
                                  {selectedRole === option.value && (
                                    <Check className="h-3.5 w-3.5 ml-1.5 text-foreground" weight="duotone" />
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {option.description}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={onClose}
                          disabled={isInviting}
                          className="text-xs w-24 text-foreground border-border/50 rounded-none"
                        >
                          cancel
                        </Button>
                        <Button 
                          type="button" 
                          variant="fm" 
                          size="sm"
                          onClick={sendInvites}
                          disabled={emails.length === 0 || isInviting}
                          className="text-xs w-24 rounded-none"
                        >
                          {isInviting ? (
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                              <span>sending...</span>
                            </div>
                          ) : (
                            <span>send</span>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 