"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { Dialog } from "@base-ui-components/react/dialog";
import { Drawer } from "vaul";
import { useIsMobile } from "@repo/design/hooks/use-is-mobile";
import { OverlayContent } from "./OverlayContent";

// ============================================================================
// Context
// ============================================================================

interface OverlayContextValue {
  close: () => void;
  showDetail: (content: ReactNode) => void;
  hideDetail: () => void;
  isDetailOpen: boolean;
}

const OverlayContext = createContext<OverlayContextValue>({
  close: () => {},
  showDetail: () => {},
  hideDetail: () => {},
  isDetailOpen: false,
});

export function useOverlay() {
  return useContext(OverlayContext);
}

export function useOverlayClose() {
  return useContext(OverlayContext).close;
}

// ============================================================================
// Props
// ============================================================================

interface DualCardOverlayProps {
  title: string;
  children: ReactNode;
  /** Where to navigate on close (defaults to /) */
  returnTo?: string;
}

// ============================================================================
// Component
// ============================================================================

export function DualCardOverlay({
  title,
  children,
  returnTo = "/",
}: DualCardOverlayProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile } = useIsMobile();
  const [dialogOpen, setDialogOpen] = useState(true);
  const [detailPanel, setDetailPanel] = useState<ReactNode>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const closingRef = useRef(false);
  const lastPathnameRef = useRef(pathname);

  // Reset animation on soft navigation within overlay
  useEffect(() => {
    if (lastPathnameRef.current !== pathname && !closingRef.current) {
      setDialogOpen(true);
    }
    lastPathnameRef.current = pathname;
  }, [pathname]);

  const handleClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setDialogOpen(false);
    // Wait for exit animation before navigating
    setTimeout(() => {
      router.push(returnTo);
    }, 280);
  }, [router, returnTo]);

  const showDetail = useCallback(
    (content: ReactNode) => {
      if (isMobile) {
        setDetailPanel(content);
        setDetailDrawerOpen(true);
      } else {
        setDetailPanel(content);
      }
    },
    [isMobile]
  );

  const hideDetail = useCallback(() => {
    if (isMobile) {
      setDetailDrawerOpen(false);
      setTimeout(() => setDetailPanel(null), 300);
    } else {
      setDetailPanel(null);
    }
  }, [isMobile]);

  const contextValue: OverlayContextValue = {
    close: handleClose,
    showDetail,
    hideDetail,
    isDetailOpen: !!detailPanel,
  };

  // Handle escape: close detail first, then overlay
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (detailPanel && !isMobile) {
          hideDetail();
        } else {
          handleClose();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [handleClose, hideDetail, detailPanel, isMobile]);

  // ========================================================================
  // Mobile: Vaul drawer
  // ========================================================================

  if (isMobile) {
    return (
      <OverlayContext.Provider value={contextValue}>
        <Drawer.Root
          open={dialogOpen}
          onOpenChange={(open) => {
            if (!open) handleClose();
          }}
          shouldScaleBackground
        >
          <Drawer.Portal>
            <Drawer.Overlay className="tk-drawer-overlay" />
            <Drawer.Content className="tk-drawer-content">
              <div className="tk-drawer-handle-wrapper">
                <div className="tk-drawer-handle" />
              </div>

              <div className="tk-overlay-header">
                <div style={{ width: 36 }} />
                <h2 className="tk-overlay-title">{title}</h2>
                <button
                  className="tk-tile"
                  onClick={handleClose}
                  aria-label="Close"
                >
                  <CloseIcon />
                </button>
              </div>

              <OverlayContent>{children}</OverlayContent>
              <div className="tk-drawer-safe-area" />
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>

        {/* Nested detail drawer */}
        {detailPanel && (
          <Drawer.Root
            open={detailDrawerOpen}
            onOpenChange={(open) => {
              if (!open) hideDetail();
            }}
            nested
          >
            <Drawer.Portal>
              <Drawer.Overlay className="tk-drawer-overlay" />
              <Drawer.Content className="tk-drawer-content">
                <div className="tk-drawer-handle-wrapper">
                  <div className="tk-drawer-handle" />
                </div>
                <OverlayContent>{detailPanel}</OverlayContent>
                <div className="tk-drawer-safe-area" />
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        )}
      </OverlayContext.Provider>
    );
  }

  // ========================================================================
  // Desktop: Base UI Dialog with dual glass cards
  // ========================================================================

  const hasDetail = !!detailPanel;

  return (
    <OverlayContext.Provider value={contextValue}>
      <Dialog.Root
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) handleClose();
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="tk-dialog-backdrop" />
          <Dialog.Popup className="tk-dialog-popup">
            <Dialog.Title className="sr-only">{title}</Dialog.Title>

            <div
              className={[
                "tk-dual-cards",
                hasDetail ? "expanded" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {/* Left card: list/nav */}
              <div
                className={`tk-card tk-card-left ${hasDetail ? "shifted" : ""}`}
              >
                <div className="tk-overlay-header">
                  <div style={{ width: 36 }} />
                  <h2 className="tk-overlay-title">{title}</h2>
                  <Dialog.Close className="tk-tile" aria-label="Close">
                    <CloseIcon />
                  </Dialog.Close>
                </div>
                <OverlayContent>{children}</OverlayContent>
              </div>

              {/* Right card: detail */}
              <div
                className={`tk-card tk-card-right ${hasDetail ? "visible" : ""}`}
              >
                {detailPanel && (
                  <>
                    <div className="tk-overlay-header">
                      <button
                        className="tk-tile"
                        onClick={hideDetail}
                        aria-label="Back"
                      >
                        <BackIcon />
                      </button>
                      <div style={{ width: 36 }} />
                      <div style={{ width: 36 }} />
                    </div>
                    <OverlayContent>{detailPanel}</OverlayContent>
                  </>
                )}
              </div>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </OverlayContext.Provider>
  );
}

// ============================================================================
// Icons (inline SVG to avoid dependencies)
// ============================================================================

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 3L5 8l5 5" />
    </svg>
  );
}
