"use client";

import {
  useActionState,
  useEffect,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/app/actions/signOut";
import {
  deleteAccount,
  type DeleteAccountState,
} from "@/app/actions/deleteAccount";
import { updateNotificationPrefs } from "@/app/actions/updateNotificationPrefs";
import { updateLeaderboardVisibility } from "@/app/actions/updateLeaderboardVisibility";

const initialDelete: DeleteAccountState = { status: "idle" };

export function AccountTab({
  email,
  notifyOnFeedback,
  notifyOnNewTasks,
  leaderboardVisible,
}: {
  email: string;
  notifyOnFeedback: boolean;
  notifyOnNewTasks: boolean;
  leaderboardVisible: boolean;
}) {
  const router = useRouter();
  const [signOutPending, startSignOut] = useTransition();
  const [notify, setNotify] = useState(notifyOnFeedback);
  const [notifyPending, startNotify] = useTransition();
  const [newTaskNotify, setNewTaskNotify] = useState(notifyOnNewTasks);
  const [newTaskNotifyPending, startNewTaskNotify] = useTransition();
  const [visible, setVisible] = useState(leaderboardVisible);
  const [visiblePending, startVisible] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteAccount,
    initialDelete,
  );
  const [confirmEmail, setConfirmEmail] = useState("");

  // Navigate after deletion completes — session cookie is already
  // cleared server-side, so the new request to `/` server-renders
  // the deletion-confirmation landing.
  useEffect(() => {
    if (deleteState.status === "success") {
      router.push("/?deleted=1");
    }
  }, [deleteState, router]);

  function toggleNotify() {
    const next = !notify;
    setNotify(next); // optimistic
    startNotify(async () => {
      const result = await updateNotificationPrefs({
        notifyOnFeedback: next,
      });
      if (!result.success) {
        setNotify(!next); // rollback
        window.dispatchEvent(
          new CustomEvent("runeships:toast", {
            detail: { text: "Couldn’t save preference. Try again." },
          }),
        );
      }
    });
  }

  function toggleNewTaskNotify() {
    const next = !newTaskNotify;
    setNewTaskNotify(next); // optimistic
    startNewTaskNotify(async () => {
      const result = await updateNotificationPrefs({
        notifyOnNewTasks: next,
      });
      if (!result.success) {
        setNewTaskNotify(!next); // rollback
        window.dispatchEvent(
          new CustomEvent("runeships:toast", {
            detail: { text: "Couldn’t save preference. Try again." },
          }),
        );
      }
    });
  }

  function toggleVisible() {
    const next = !visible;
    setVisible(next); // optimistic
    startVisible(async () => {
      const result = await updateLeaderboardVisibility(next);
      if (!result.success) {
        setVisible(!next); // rollback
        window.dispatchEvent(
          new CustomEvent("runeships:toast", {
            detail: { text: "Couldn’t save preference. Try again." },
          }),
        );
      }
    });
  }

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* ─── Sign-in ─────────────────────────────────────────── */}
      <section className="max-w-[680px]">
        <h2 className="font-display font-light text-[22px] sm:text-[24px] leading-[1.15] tracking-[-0.018em] text-ink">
          Sign-in
        </h2>
        <hr className="mt-4 border-0 border-t border-ink/10" />

        <div className="mt-7">
          <p className="text-[11px] tracking-[0.18em] uppercase text-muted mb-2.5">
            Email
          </p>
          <p className="font-display text-[18px] text-ink">{email}</p>
          <p className="mt-3 text-[13px] leading-[1.55] text-muted max-w-[58ch]">
            Your email is your sign-in identity. To change it, contact{" "}
            <a
              href="mailto:hello@runeships.com"
              className="link-anim text-oxblood hover:text-oxblood-hover transition-colors duration-200 ease-out"
            >
              hello@runeships.com
            </a>.
          </p>
        </div>

        <div className="mt-7">
          <button
            type="button"
            disabled={signOutPending}
            onClick={() => startSignOut(() => signOut())}
            className="
              inline-flex items-center min-h-[48px] px-6
              bg-transparent text-oxblood border border-oxblood
              text-[14px] tracking-[0.01em] font-medium
              transition-colors duration-200 ease-out
              hover:bg-oxblood hover:text-cream
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            {signOutPending ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </section>

      {/* ─── Notifications ───────────────────────────────────── */}
      <section className="max-w-[680px]">
        <h2 className="font-display font-light text-[22px] sm:text-[24px] leading-[1.15] tracking-[-0.018em] text-ink">
          Notifications
        </h2>
        <hr className="mt-4 border-0 border-t border-ink/10" />

        <div className="mt-7">
          <label className="flex items-start gap-4 cursor-pointer select-none">
            <button
              type="button"
              role="switch"
              aria-checked={notify}
              onClick={toggleNotify}
              disabled={notifyPending}
              className={`
                relative shrink-0 mt-0.5 w-11 h-6 border transition-colors duration-200 ease-out
                disabled:opacity-60 disabled:cursor-not-allowed
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood
                ${notify
                  ? "bg-oxblood border-oxblood"
                  : "bg-cream border-ink/30"
                }
              `}
            >
              <span
                aria-hidden
                className={`
                  absolute top-[1px] w-[18px] h-[18px] transition-all duration-200 ease-out
                  ${notify ? "left-[22px] bg-cream" : "left-[1px] bg-ink/70"}
                `}
              />
            </button>
            <span>
              <span className="block text-[15px] tracking-[-0.005em] text-ink">
                Email me when I receive feedback on a submission
              </span>
              <span className="block mt-2 text-[13px] leading-[1.55] text-muted max-w-[54ch]">
                Sent immediately when AI feedback completes or when the
                RuneShips team finishes a human review.
              </span>
            </span>
          </label>

          {/* Second toggle: new task announcements */}
          <label className="mt-7 flex items-start gap-4 cursor-pointer select-none">
            <button
              type="button"
              role="switch"
              aria-checked={newTaskNotify}
              onClick={toggleNewTaskNotify}
              disabled={newTaskNotifyPending}
              className={`
                relative shrink-0 mt-0.5 w-11 h-6 border transition-colors duration-200 ease-out
                disabled:opacity-60 disabled:cursor-not-allowed
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood
                ${newTaskNotify
                  ? "bg-oxblood border-oxblood"
                  : "bg-cream border-ink/30"
                }
              `}
            >
              <span
                aria-hidden
                className={`
                  absolute top-[1px] w-[18px] h-[18px] transition-all duration-200 ease-out
                  ${newTaskNotify ? "left-[22px] bg-cream" : "left-[1px] bg-ink/70"}
                `}
              />
            </button>
            <span>
              <span className="block text-[15px] tracking-[-0.005em] text-ink">
                Email me when new tasks are published that match my interests
              </span>
              <span className="block mt-2 text-[13px] leading-[1.55] text-muted max-w-[54ch]">
                Matching is based on the career tracks you selected during
                onboarding. You can update those in the Profile tab.
              </span>
            </span>
          </label>
        </div>
      </section>

      {/* ─── Leaderboard visibility ──────────────────────────── */}
      <section className="max-w-[680px]">
        <h2 className="font-display font-light text-[22px] sm:text-[24px] leading-[1.15] tracking-[-0.018em] text-ink">
          Leaderboard visibility
        </h2>
        <hr className="mt-4 border-0 border-t border-ink/10" />

        <div className="mt-7">
          <label className="flex items-start gap-4 cursor-pointer select-none">
            <button
              type="button"
              role="switch"
              aria-checked={visible}
              onClick={toggleVisible}
              disabled={visiblePending}
              className={`
                relative shrink-0 mt-0.5 w-11 h-6 border transition-colors duration-200 ease-out
                disabled:opacity-60 disabled:cursor-not-allowed
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood
                ${visible
                  ? "bg-oxblood border-oxblood"
                  : "bg-cream border-ink/30"
                }
              `}
            >
              <span
                aria-hidden
                className={`
                  absolute top-[1px] w-[18px] h-[18px] transition-all duration-200 ease-out
                  ${visible ? "left-[22px] bg-cream" : "left-[1px] bg-ink/70"}
                `}
              />
            </button>
            <span>
              <span className="block text-[15px] tracking-[-0.005em] text-ink">
                Show me on the leaderboard
              </span>
              <span className="block mt-2 text-[13px] leading-[1.55] text-muted max-w-[54ch]">
                When enabled, your name, school, and scores appear on the
                public RuneShips leaderboard. Disable to keep your profile
                private; your work and feedback remain available to you
                either way.
              </span>
            </span>
          </label>
        </div>
      </section>

      {/* ─── Delete account ──────────────────────────────────── */}
      <section className="max-w-[680px]">
        <h2 className="font-display font-light text-[22px] sm:text-[24px] leading-[1.15] tracking-[-0.018em] text-ink">
          Delete account
        </h2>
        <hr className="mt-4 border-0 border-t border-ink/10" />

        <div className="mt-7">
          <p className="text-[15px] leading-[1.6] text-ink/85 max-w-[58ch]">
            This permanently removes your account, all submissions, feedback,
            and skill scores. This cannot be undone.
          </p>

          {!confirming ? (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="
                  inline-flex items-center min-h-[48px] px-6
                  bg-transparent text-oxblood border border-oxblood
                  text-[14px] tracking-[0.01em] font-medium
                  transition-colors duration-200 ease-out
                  hover:bg-oxblood hover:text-cream
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood
                "
              >
                Delete my account
              </button>
            </div>
          ) : (
            <form action={deleteAction} className="mt-7 border-l-2 border-oxblood pl-6 sm:pl-8 max-w-[60ch]">
              <p className="text-[11px] tracking-[0.18em] uppercase text-oxblood">
                Confirm deletion
              </p>
              <p className="mt-3 text-[15px] leading-[1.6] text-ink/85">
                Type your email to confirm:
              </p>
              <input
                type="email"
                name="confirm_email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder={email}
                disabled={deletePending}
                autoComplete="off"
                spellCheck={false}
                className="
                  mt-4 w-full min-h-[52px] px-4
                  border border-ink/25 bg-cream text-ink placeholder:text-muted/80
                  text-[15px] tracking-[-0.005em]
                  outline-none
                  transition-colors duration-150 ease-out
                  focus:border-oxblood focus:ring-1 focus:ring-oxblood
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              />
              {deleteState.status === "error" && (
                <p role="alert" className="mt-4 text-[14px] leading-snug text-oxblood">
                  {deleteState.message}
                </p>
              )}
              <div className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-3">
                <button
                  type="submit"
                  disabled={
                    deletePending ||
                    confirmEmail.trim().toLowerCase() !== email.trim().toLowerCase()
                  }
                  aria-busy={deletePending}
                  className={`
                    inline-flex items-center min-h-[48px] px-7
                    bg-oxblood text-cream border border-oxblood
                    text-[14px] tracking-[0.01em] font-medium
                    transition-colors duration-200 ease-out
                    hover:bg-oxblood-hover focus-visible:bg-oxblood-hover
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood
                    disabled:opacity-40 disabled:cursor-not-allowed
                    ${deletePending ? "btn-pulse" : ""}
                  `}
                >
                  {deletePending ? "Deleting…" : "Confirm deletion"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirming(false);
                    setConfirmEmail("");
                  }}
                  disabled={deletePending}
                  className="
                    link-anim text-[13px] tracking-[0.005em] text-muted
                    hover:text-ink transition-colors duration-200 ease-out
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
