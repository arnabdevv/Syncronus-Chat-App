import { useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAppStore } from "@/store";
import { apiClient } from "@/lib/api-client";
import { GET_DM_CONTACTS_ROUTE, HOST } from "@/utils/constants";
import { getColor } from "@/lib/utils";
import NewDM from "./components/new-dm";
import ProfileInfo from "./components/profile-info";

// ── helpers ──────────────────────────────────────────────────────────────────

const formatTime = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

// ── DMContactList ─────────────────────────────────────────────────────────────

// ── SidebarTick ──────────────────────────────────────────────────────────────
// Compact version of the message-bubble tick — shown next to the preview text.

const SidebarTick = ({ status }) => {
  if (status === "read") {
    return (
      <svg
        width="16"
        height="10"
        viewBox="0 0 16 10"
        fill="none"
        className="flex-shrink-0"
      >
        <path
          d="M1 5L4.5 8.5L10 1"
          stroke="#8B5CF6"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 5L8.5 8.5L14 1"
          stroke="#8B5CF6"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (status === "delivered") {
    return (
      <svg
        width="16"
        height="10"
        viewBox="0 0 16 10"
        fill="none"
        className="flex-shrink-0"
      >
        <path
          d="M1 5L4.5 8.5L10 1"
          stroke="#8696A0"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 5L8.5 8.5L14 1"
          stroke="#8696A0"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      className="flex-shrink-0"
    >
      <path
        d="M1 5L4 8L9 1"
        stroke="#8696A0"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const DMContactList = () => {
  const { dmContacts, setSelectedChatType, setSelectedChatData, userInfo } =
    useAppStore();

  if (!dmContacts.length) {
    return (
      <p className="text-center text-neutral-500 text-xs py-4">
        No conversations yet. Start one with the + button above.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-1 px-2">
      {dmContacts.map((contact) => {
        const initials =
          contact.firstName && contact.lastName
            ? `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase()
            : (contact.email?.[0] ?? "?").toUpperCase();

        const displayName =
          contact.firstName && contact.lastName
            ? `${contact.firstName} ${contact.lastName}`
            : contact.email;

        const isUnread =
          contact.lastMessageSenderId !== userInfo?.id &&
          contact.lastMessageStatus !== "read";

        return (
          <li key={contact._id}>
            <button
              onClick={() => {
                setSelectedChatType("contact");
                setSelectedChatData(contact);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors duration-150 text-left"
            >
              {/* Avatar */}
              <Avatar className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                {contact.image ? (
                  <AvatarImage
                    src={`${HOST}/${contact.image}`}
                    alt={displayName}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <AvatarFallback
                    className={`h-10 w-10 text-sm font-bold uppercase flex items-center justify-center rounded-full ${getColor(contact.colors)}`}
                  >
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>

              {/* Name + timestamp */}
              <div className="flex-1 min-w-0">
                {/* Row 1: name + timestamp */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-white truncate">
                    {displayName}
                  </span>
                  {contact.lastMessageTime && (
                    <span className="text-[10px] text-neutral-500 flex-shrink-0">
                      {formatTime(contact.lastMessageTime)}
                    </span>
                  )}
                </div>

                {/* Row 2: tick + last message preview */}
                {contact.lastMessageType && (
                  <div className="flex items-center gap-1 mt-0.5 min-w-0">
                    {/* Show tick only if the last message was sent by us */}
                    {contact.lastMessageSenderId === userInfo?.id && (
                      <SidebarTick status={contact.lastMessageStatus} />
                    )}
                    <p
                      className={`text-xs truncate ${
                        isUnread ? "text-white font-bold" : "text-neutral-500"
                      }`}
                    >
                      {contact.lastMessageType === "file"
                        ? "📎 File"
                        : contact.lastMessageContent}
                    </p>
                  </div>
                )}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
};

// ── ContactsContainer ─────────────────────────────────────────────────────────

const ContactsContainer = () => {
  const { setDmContacts } = useAppStore();

  // Fetch DM contacts on mount
  useEffect(() => {
    const fetchDmContacts = async () => {
      try {
        const { data } = await apiClient.get(GET_DM_CONTACTS_ROUTE);
        setDmContacts(data.contacts);
      } catch (err) {
        console.error(
          "[ContactsContainer] Failed to load DM contacts:",
          err.message,
        );
      }
    };

    fetchDmContacts();
  }, [setDmContacts]);

  return (
    <div className="relative md:w-[35vw] lg:w-[30vw] xl:w-[20vw] bg-surface-container/50 backdrop-blur-md border-r border-white/5 w-full flex flex-col z-10">
      <div className="pt-3">
        <Logo />
      </div>

      {/* Direct Messages section */}
      <div className="my-5">
        <div className="flex items-center justify-between pr-10 mb-2">
          <Title text="Direct Messages" />
          <NewDM />
        </div>
        <DMContactList />
      </div>

      {/* Channels section */}
      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
          <Title text="Channels" />
        </div>
      </div>

      <ProfileInfo />
    </div>
  );
};

export default ContactsContainer;

// ── Logo & Title ──────────────────────────────────────────────────────────────

export const Logo = () => {
  return (
    <div className="flex p-5 justify-start items-center gap-2">
      <svg
        id="logo-38"
        width="78"
        height="32"
        viewBox="0 0 78 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {" "}
        <path
          d="M55.5 0H77.5L58.5 32H36.5L55.5 0Z"
          className="ccustom"
          fill="#8B5CF6"
        ></path>{" "}
        <path
          d="M35.5 0H51.5L32.5 32H16.5L35.5 0Z"
          className="ccompli1"
          fill="#6D3BD7"
        ></path>{" "}
        <path
          d="M19.5 0H31.5L12.5 32H0.5L19.5 0Z"
          className="ccompli2"
          fill="#4F46E5"
        ></path>{" "}
      </svg>
      <span className="text-3xl font-semibold">Syncronus</span>
    </div>
  );
};

const Title = ({ text }) => {
  return (
    <h6 className="uppercase tracking-widest text-neutral-400 pl-10 font-light text-opacity-90 text-sm">
      {text}
    </h6>
  );
};
