/**
 * CSS styles for HTML exports
 */
export function getStyles(theme: 'dark' | 'light'): string {
  const isDark = theme === 'dark';

  return `
/* General styles */
body {
  margin: 0;
  padding: 0;
  font-family: "Whitney", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 14px;
  background-color: ${isDark ? '#36393f' : '#ffffff'};
  color: ${isDark ? '#dcddde' : '#2e3338'};
}

a {
  color: ${isDark ? '#00aff4' : '#0068e0'};
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

img {
  object-fit: contain;
}

/* Scrollbar styles */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-thumb {
  background-color: ${isDark ? '#202225' : '#c1c3c7'};
  border-radius: 4px;
}

/* Preamble */
.preamble {
  display: grid;
  grid-template-columns: auto 1fr;
  max-width: 100%;
  padding: 16px;
  margin: 16px;
  background-color: ${isDark ? '#2f3136' : '#f2f3f5'};
  border-radius: 8px;
}

.preamble__guild-icon-container {
  grid-column: 1;
}

.preamble__guild-icon {
  width: 88px;
  height: 88px;
  border-radius: 50%;
}

.preamble__entries-container {
  grid-column: 2;
  padding-left: 16px;
}

.preamble__entry {
  font-size: 14px;
  margin-bottom: 4px;
}

.preamble__entry--large {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

/* Chatlog container */
.chatlog {
  max-width: 100%;
  padding: 16px;
}

/* Message group */
.chatlog__message-group {
  display: flex;
  padding: 16px 0;
  border-top: 1px solid ${isDark ? '#42454a' : '#f0f1f2'};
}

.chatlog__message-group:first-child {
  border-top: none;
}

/* Avatar */
.chatlog__avatar-container {
  flex-shrink: 0;
  width: 40px;
  margin-right: 16px;
}

.chatlog__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

/* Messages */
.chatlog__messages {
  flex-grow: 1;
  min-width: 0;
}

/* Message header */
.chatlog__header {
  display: flex;
  align-items: baseline;
  margin-bottom: 4px;
}

.chatlog__author {
  font-weight: 600;
  margin-right: 8px;
}

.chatlog__timestamp {
  font-size: 12px;
  color: ${isDark ? '#a3a6aa' : '#72767d'};
}

.chatlog__edited {
  font-size: 10px;
  color: ${isDark ? '#a3a6aa' : '#72767d'};
}

/* Content */
.chatlog__content {
  margin-top: 2px;
  word-wrap: break-word;
}

/* Reply */
.chatlog__reply {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  font-size: 12px;
  color: ${isDark ? '#b9bbbe' : '#72767d'};
}

.chatlog__reply-avatar {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: 4px;
}

.chatlog__reply-author {
  font-weight: 600;
  margin-right: 8px;
}

/* Attachments */
.chatlog__attachment {
  margin-top: 8px;
}

.chatlog__attachment--image img {
  max-width: 400px;
  max-height: 300px;
  border-radius: 4px;
}

.chatlog__attachment--video video {
  max-width: 400px;
  max-height: 300px;
  border-radius: 4px;
}

/* Embeds */
.chatlog__embed {
  display: flex;
  margin-top: 8px;
  max-width: 520px;
  background-color: ${isDark ? '#2f3136' : '#f2f3f5'};
  border-radius: 4px;
  border-left: 4px solid ${isDark ? '#4f545c' : '#e3e5e8'};
}

.chatlog__embed-content {
  padding: 8px 16px 16px 12px;
  overflow: hidden;
}

.chatlog__embed-author {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.chatlog__embed-author-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 8px;
}

.chatlog__embed-author-name {
  font-size: 12px;
  font-weight: 600;
}

.chatlog__embed-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.chatlog__embed-description {
  font-size: 14px;
  margin-bottom: 8px;
}

.chatlog__embed-fields {
  display: flex;
  flex-wrap: wrap;
}

.chatlog__embed-field {
  flex: 0 0 100%;
  margin-bottom: 8px;
}

.chatlog__embed-field--inline {
  flex: 0 0 33%;
}

.chatlog__embed-field-name {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 2px;
}

.chatlog__embed-field-value {
  font-size: 14px;
}

.chatlog__embed-thumbnail {
  margin-left: 16px;
  max-width: 80px;
  max-height: 80px;
  border-radius: 4px;
}

.chatlog__embed-images {
  margin-top: 8px;
}

.chatlog__embed-images img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 4px;
}

.chatlog__embed-footer {
  display: flex;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
  color: ${isDark ? '#a3a6aa' : '#72767d'};
}

.chatlog__embed-footer-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 8px;
}

/* Reactions */
.chatlog__reactions {
  display: flex;
  flex-wrap: wrap;
  margin-top: 8px;
}

.chatlog__reaction {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  margin-right: 4px;
  margin-bottom: 4px;
  background-color: ${isDark ? '#2f3136' : '#f2f3f5'};
  border-radius: 4px;
}

.chatlog__reaction-emoji {
  width: 16px;
  height: 16px;
  margin-right: 4px;
}

.chatlog__reaction-count {
  font-size: 12px;
  color: ${isDark ? '#b9bbbe' : '#72767d'};
}

/* Stickers */
.chatlog__sticker {
  margin-top: 8px;
}

.chatlog__sticker img {
  width: 160px;
  height: 160px;
}

/* Markdown styles */
.chatlog__markdown-spoiler {
  background-color: ${isDark ? '#202225' : '#e3e5e8'};
  border-radius: 3px;
  padding: 0 4px;
}

.chatlog__markdown-spoiler--hidden {
  background-color: ${isDark ? '#202225' : '#c4c9ce'};
  color: transparent;
  cursor: pointer;
}

.chatlog__markdown-spoiler--hidden * {
  color: transparent;
}

.chatlog__markdown-quote {
  display: flex;
  margin: 4px 0;
}

.chatlog__markdown-quote-border {
  width: 4px;
  background-color: ${isDark ? '#4f545c' : '#c4c9ce'};
  border-radius: 4px;
  margin-right: 8px;
}

.chatlog__markdown-quote-content {
  flex-grow: 1;
}

.chatlog__markdown-pre {
  font-family: "Consolas", "Courier New", monospace;
  font-size: 13px;
  background-color: ${isDark ? '#2f3136' : '#f2f3f5'};
  border-radius: 4px;
}

.chatlog__markdown-pre--inline {
  padding: 2px 4px;
}

.chatlog__markdown-pre--multiline {
  display: block;
  padding: 8px;
  margin: 4px 0;
  overflow-x: auto;
  white-space: pre;
}

.chatlog__markdown-mention {
  background-color: ${isDark ? 'rgba(88, 101, 242, 0.3)' : 'rgba(88, 101, 242, 0.15)'};
  color: ${isDark ? '#dee0fc' : '#5865f2'};
  padding: 0 2px;
  border-radius: 3px;
}

.chatlog__markdown-timestamp {
  background-color: ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(6, 6, 7, 0.06)'};
  padding: 0 2px;
  border-radius: 3px;
}

.chatlog__emoji {
  width: 22px;
  height: 22px;
  vertical-align: middle;
}

.chatlog__emoji--large {
  width: 48px;
  height: 48px;
}

/* System messages */
.chatlog__message--system {
  color: ${isDark ? '#a3a6aa' : '#72767d'};
  font-style: italic;
}

/* Pinned indicator */
.chatlog__pinned {
  display: inline-block;
  padding: 2px 6px;
  background-color: ${isDark ? '#4f545c' : '#e3e5e8'};
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  margin-left: 8px;
}

/* Postamble */
.postamble {
  padding: 16px;
  margin: 16px;
  text-align: center;
  font-size: 12px;
  color: ${isDark ? '#72767d' : '#99aab5'};
}
`;
}
