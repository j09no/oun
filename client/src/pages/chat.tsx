import { useState, useRef, useEffect } from "react";
import { X, Image as ImageIcon, Paperclip, Smile, Mic, Send } from "lucide-react";

interface Message {
  id: number;
  text: string;
  timestamp: Date;
  sender: "user";
}

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from Supabase on component mount
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch('/api/messages');
        const data = await response.json();
        const formattedMessages = data.map((msg: any) => ({
          id: msg.id,
          text: msg.text,
          timestamp: new Date(msg.createdAt),
          sender: msg.sender
        }));
        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
  }, []);

  const emojis = [
    // Smileys & Emotion
    "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃",
    "🫠", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "☺️",
    "😚", "😙", "🥲", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗",
    "🤭", "🫢", "🫣", "🤫", "🤔", "🫡", "🤐", "🤨", "😐", "😑",
    "😶", "🫥", "😶‍🌫️", "😏", "😒", "🙄", "😬", "😮‍💨", "🤥", "😔",
    "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵",
    "🥶", "🥴", "😵", "😵‍💫", "🤯", "🤠", "🥳", "🥸", "😎", "🤓",
    "🧐", "😕", "🫤", "😟", "🙁", "☹️", "😮", "😯", "😲", "😳",
    "🥺", "🥹", "😦", "😧", "😨", "😰", "😥", "😢", "😭", "😱",
    "😖", "😣", "😞", "😓", "😩", "😫", "🥱", "😤", "😡", "😠",
    "🤬", "😈", "👿", "💀", "☠️", "💩", "🤡", "👹", "👺", "👻",
    "👽", "👾", "🤖", "😺", "😸", "😹", "😻", "😼", "😽", "🙀",
    "😿", "😾",

    // People & Body
    "👋", "🤚", "🖐️", "✋", "🖖", "🫱", "🫲", "🫳", "🫴", "👌",
    "🤌", "🤏", "✌️", "🤞", "🫰", "🤟", "🤘", "🤙", "👈", "👉",
    "👆", "🖕", "👇", "☝️", "🫵", "👍", "👎", "👊", "✊", "🤛",
    "🤜", "👏", "🙌", "🫶", "👐", "🤲", "🤝", "🙏", "✍️", "💅",
    "🤳", "💪", "🦾", "🦿", "🦵", "🦶", "👂", "🦻", "👃", "🧠",
    "🫀", "🫁", "🦷", "🦴", "👀", "👁️", "👅", "👄", "🫦", "💋",

    // Animals & Nature
    "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐻‍❄️", "🐨",
    "🐯", "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊",
    "🐒", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉",
    "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🪲", "🐛", "🦋", "🐌",
    "🐞", "🐜", "🪰", "🪱", "🦗", "🕷️", "🕸️", "🦂", "🐢", "🐍",
    "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠",
    "🐟", "🐬", "🐳", "🐋", "🦈", "🪸", "🐊", "🐅", "🐆", "🦓",
    "🦍", "🦧", "🦣", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒", "🦘",
    "🦬", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🦙", "🐐",
    "🦌", "🐕", "🐩", "🦮", "🐕‍🦺", "🐈", "🐈‍⬛", "🪶", "🐓", "🦃",
    "🦤", "🦚", "🦜", "🦢", "🦩", "🕊️", "🐇", "🦝", "🦨", "🦡",
    "🦫", "🦦", "🦥", "🐁", "🐀", "🐿️", "🦔",

    // Food & Drink
    "🍎", "🍏", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐",
    "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑",
    "🥦", "🥬", "🥒", "🌶️", "🫑", "🌽", "🥕", "🫒", "🧄", "🧅",
    "🥔", "🍠", "🥐", "🥖", "🍞", "🥨", "🥯", "🧀", "🥚", "🍳",
    "🧈", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🦴", "🌭", "🍔",
    "🍟", "🍕", "🫓", "🥪", "🥙", "🧆", "🌮", "🌯", "🫔", "🥗",
    "🥘", "🫕", "🥫", "🍝", "🍜", "🍲", "🍛", "🍣", "🍱", "🥟",
    "🦪", "🍤", "🍙", "🍚", "🍘", "🍥", "🥠", "🥮", "🍢", "🍡",
    "🍧", "🍨", "🍦", "🥧", "🧁", "🍰", "🎂", "🍮", "🍭", "🍬",
    "🍫", "🍿", "🍩", "🍪", "🌰", "🥜", "🍯", "🥛", "🍼", "🫖",
    "☕", "🍵", "🧃", "🥤", "🧋", "🍶", "🍺", "🍻", "🥂", "🍷",
    "🥃", "🍸", "🍹", "🧉", "🍾",

    // Activities
    "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱",
    "🪀", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅", "⛳",
    "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛼", "🛷",
    "⛸️", "🥌", "🎿", "⛷️", "🏂", "🪂", "🏋️‍♀️", "🏋️", "🏋️‍♂️", "🤼‍♀️",
    "🤼", "🤼‍♂️", "🤸‍♀️", "🤸", "🤸‍♂️", "⛹️‍♀️", "⛹️", "⛹️‍♂️", "🤺", "🤾‍♀️",
    "🤾", "🤾‍♂️", "🏌️‍♀️", "🏌️", "🏌️‍♂️", "🏇", "🧘‍♀️", "🧘", "🧘‍♂️", "🏄‍♀️",
    "🏄", "🏄‍♂️", "🏊‍♀️", "🏊", "🏊‍♂️", "🤽‍♀️", "🤽", "🤽‍♂️", "🚣‍♀️", "🚣",
    "🚣‍♂️", "🧗‍♀️", "🧗", "🧗‍♂️", "🚵‍♀️", "🚵", "🚵‍♂️", "🚴‍♀️", "🚴", "🚴‍♂️",

    // Travel & Places
    "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐",
    "🛻", "🚚", "🚛", "🚜", "🏍️", "🛵", "🚲", "🛴", "🛺", "🚨",
    "🚔", "🚍", "🚘", "🚖", "🚡", "🚠", "🚟", "🚃", "🚋", "🚞",
    "🚝", "🚄", "🚅", "🚈", "🚂", "🚆", "🚇", "🚊", "🚉", "✈️",
    "🛫", "🛬", "🛩️", "💺", "🛰️", "🚀", "🛸", "🚁", "🛶", "⛵",
    "🚤", "🛥️", "🛳️", "⛴️", "🚢", "⚓", "🪝", "⛽", "🚧", "🚦",
    "🚥", "🗺️", "🗿", "🗽", "🗼", "🏰", "🏯", "🏟️", "🎡", "🎢",
    "🎠", "⛲", "⛱️", "🏖️", "🏝️", "🏜️", "🌋", "⛰️", "🏔️", "🗻",
    "🏕️", "⛺", "🛖", "🏠", "🏡", "🏘️", "🏚️", "🏗️", "🏭", "🏢",
    "🏬", "🏣", "🏤", "🏥", "🏦", "🏨", "🏪", "🏫", "🏩", "💒",
    "🏛️", "⛪", "🕌", "🛕", "🕍", "🕊️", "🏁", "🚩", "🏴", "🏳️",

    // Objects
    "⌚", "📱", "📲", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "🖲️", "🕹️",
    "🗜️", "💽", "💾", "💿", "📀", "📼", "📷", "📸", "📹", "🎥",
    "📽️", "🎞️", "📞", "☎️", "📟", "📠", "📺", "📻", "🎙️", "🎚️",
    "🎛️", "🧭", "⏱️", "⏲️", "⏰", "🕰️", "⌛", "⏳", "📡", "🔋",
    "🪫", "🔌", "💡", "🔦", "🕯️", "🪔", "🧯", "🛢️", "💸", "💵",
    "💴", "💶", "💷", "🪙", "💰", "💳", "💎", "⚖️", "🪜", "🧰",
    "🪛", "🔧", "🔨", "⚒️", "🛠️", "⛏️", "🪓", "🪚", "🔩", "⚙️",
    "🪤", "🧱", "⛓️", "🧲", "🔫", "💣", "🧨", "🪓", "🔪", "🗡️",
    "⚔️", "🛡️", "🚬", "⚰️", "🪦", "⚱️", "🏺", "🔮", "📿", "🧿",
    "💈", "⚗️", "🔭", "🔬", "🕳️", "🩹", "🩺", "💊", "💉", "🩸",
    "🧬", "🦠", "🧫", "🧪", "🌡️", "🧹", "🪠", "🧽", "🪣", "🧴",
    "🛎️", "🔑", "🗝️", "🚪", "🪑", "🛋️", "🛏️", "🛌", "🧸", "🪆",

    // Symbols
    "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
    "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "☮️",
    "✝️", "☪️", "🕉️", "☸️", "✡️", "🔯", "🕎", "☯️", "☦️", "🛐",
    "⛎", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐",
    "♑", "♒", "♓", "🆔", "⚛️", "🉑", "☢️", "☣️", "📴", "📳",
    "🈶", "🈚", "🈸", "🈺", "🈷️", "✴️", "🆚", "💮", "🉐", "㊙️",
    "㊗️", "🈴", "🈵", "🈹", "🈲", "🅰️", "🅱️", "🆎", "🆑", "🅾️",
    "🆘", "❌", "⭕", "🛑", "⛔", "📛", "🚫", "💯", "💢", "♨️",
    "🚷", "🚯", "🚳", "🚱", "🔞", "📵", "🚭", "❗", "❕", "❓",
    "❔", "‼️", "⁉️", "🔅", "🔆", "〽️", "⚠️", "🚸", "🔱", "⚜️",
    "🔰", "♻️", "✅", "🈯", "💹", "❇️", "✳️", "❎", "🌐", "💠",
    "Ⓜ️", "🌀", "💤", "🏧", "🚾", "♿", "🅿️", "🛗", "🈳", "🈂️",
    "🛂", "🛃", "🛄", "🛅", "🚹", "🚺", "🚼", "⚧️", "🚻", "🚮",
    "🎦", "📶", "🈁", "🔣", "ℹ️", "🔤", "🔡", "🔠", "🆖", "🆗",
    "🆙", "🆒", "🆕", "🆓", "0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣",
    "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟", "🔢", "#️⃣", "*️⃣", "⏏️", "▶️",
    "⏸️", "⏯️", "⏹️", "⏺️", "⏭️", "⏮️", "⏩", "⏪", "⏫", "⏬",
    "◀️", "🔼", "🔽", "➡️", "⬅️", "⬆️", "⬇️", "↗️", "↘️", "↙️",
    "↖️", "↕️", "↔️", "↪️", "↩️", "⤴️", "⤵️", "🔀", "🔁", "🔂",
    "🔄", "🔃", "🎵", "🎶", "➕", "➖", "➗", "✖️", "🟰", "♾️",
    "💲", "💱", "™️", "©️", "®️", "〰️", "➰", "➿", "🔚", "🔙",
    "🔛", "🔝", "🔜", "✔️", "☑️", "🔘", "🔴", "🟠", "🟡", "🟢",
    "🔵", "🟣", "⚫", "⚪", "🟤", "🔺", "🔻", "🔸", "🔹", "🔶",
    "🔷", "🔳", "🔲", "▪️", "▫️", "◾", "◽", "◼️", "◻️", "🟥",
    "🟧", "🟨", "🟩", "🟦", "🟪", "⬛", "⬜", "🟫", "🔈", "🔇",
    "🔉", "🔊", "📢", "📣", "📯", "🔔", "🔕", "🎼", "🎵", "🎶",
    "🎙️", "🎚️", "🎛️", "🎤", "🎧", "📻", "🎷", "🪗", "🎸", "🎹",
    "🎺", "🎻", "🪕", "🥁", "🪘", "🎪", "🎭", "🩰", "🎨", "🎬",
    "🎤", "🎧", "🎼", "🎵", "🎶", "🎙️", "🎚️", "🎛️", "🎸", "🎹",
    "🎺", "🎻", "🪕", "🥁", "🪘"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      text: message,
      timestamp: new Date(),
      sender: "user"
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage("");

    // Save message to Supabase
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: newMessage.text,
          sender: newMessage.sender,
        }),
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-[#18181b] p-4">
      <div className="relative p-4 w-full max-w-xl max-h-full">
        <div className="relative bg-[#27272a] rounded-lg shadow-2xl border border-gray-800">
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-700 rounded-t">
            <h3 className="text-lg font-bold text-white">
              Send Message
            </h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-700 hover:text-white rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center transition-colors"
            >
              <X className="w-4 h-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>

          {/* Messages Display */}
          <div className="p-4 max-h-96 overflow-y-auto border-b border-gray-700">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <p>No messages yet</p>
                <p className="text-sm mt-1">Start a conversation!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-xs lg:max-w-md px-4 py-2 bg-blue-500 text-white rounded-lg">
                      <p className="text-sm" style={{ fontFamily: '"iOS Emoji", "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif' }}>{msg.text}</p>
                      <p className="text-xs text-blue-100 mt-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 md:p-5">
            <div className="relative mb-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="p-4 pb-12 block w-full h-60 bg-[#18181b] border border-gray-700 rounded-lg text-white text-md focus:border-gray-600 focus:ring-0 focus:outline-none resize-none placeholder-gray-400"
                placeholder="Write a message..."
                required
              />

              {/* Bottom Controls */}
              <div className="absolute bottom-0 inset-x-0 p-2 rounded-b-md">
                <div className="flex justify-between items-center">
                  {/* Left Controls */}
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      className="inline-flex flex-shrink-0 justify-center items-center w-10 h-10 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                    >
                      <label htmlFor="image" className="cursor-pointer">
                        <ImageIcon className="w-5 h-5" />
                        <input name="image" id="image" type="file" className="hidden" accept="image/*" />
                      </label>
                    </button>

                    <button
                      type="button"
                      className="inline-flex flex-shrink-0 justify-center items-center w-10 h-10 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                    >
                      <label htmlFor="attachment" className="cursor-pointer">
                        <Paperclip className="w-5 h-5" />
                        <input name="attachment" id="attachment" type="file" className="hidden" />
                      </label>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="inline-flex flex-shrink-0 justify-center items-center w-10 h-10 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Right Controls */}
                  <div className="flex items-center gap-x-1">
                    <button
                      type="button"
                      className="inline-flex flex-shrink-0 justify-center items-center w-10 h-10 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                    >
                      <Mic className="w-5 h-5" />
                    </button>

                    <button
                      type="submit"
                      disabled={!message.trim()}
                      className="inline-flex flex-shrink-0 justify-center items-center w-10 h-10 rounded-lg text-white bg-blue-500 hover:bg-blue-600 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Character Count */}
            <div className="text-xs text-gray-400 text-right">
              {message.length}/1000
            </div>
          </form>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-4 right-4 bg-[#27272a] border border-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto z-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-white">Select Emoji</h4>
              <button
                onClick={() => setShowEmojiPicker(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-8 gap-2">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiSelect(emoji)}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-700 rounded transition-colors"
                  style={{ fontFamily: '"iOS Emoji", "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif' }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}