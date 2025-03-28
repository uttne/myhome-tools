import { useState } from "react";
import { ControlBox } from "./parts/ControlBox";
import { ContentArea } from "./parts/ContentArea";
import { Sidebar } from "./parts/Sidebar";

const cards = [
  { id: 1, title: "カード1", description: "これはカード1の説明です。" },
  { id: 2, title: "カード2", description: "これはカード2の説明です。" },
  { id: 3, title: "カード3", description: "これはカード3の説明です。" },
  { id: 4, title: "カード4", description: "これはカード4の説明です。" },
  { id: 5, title: "カード5", description: "これはカード5の説明です。" },
  { id: 6, title: "カード6", description: "これはカード6の説明です。" },
  { id: 7, title: "カード7", description: "これはカード7の説明です。" },
  { id: 8, title: "カード8", description: "これはカード8の説明です。" },
  { id: 9, title: "カード9", description: "これはカード9の説明です。" },
  { id: 10, title: "カード10", description: "これはカード10の説明です。" },
  { id: 11, title: "カード11", description: "これはカード11の説明です。" },
  { id: 12, title: "カード12", description: "これはカード12の説明です。" },
  { id: 13, title: "カード13", description: "これはカード13の説明です。" },
  { id: 14, title: "カード14", description: "これはカード14の説明です。" },
  { id: 15, title: "カード15", description: "これはカード15の説明です。" },
  { id: 16, title: "カード16", description: "これはカード16の説明です。" },
];

const Card = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-xl transition-shadow duration-300">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

function App() {
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen(!isOpen);
  return (
    <>
      <div className="flex flex-col h-screen">
        <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
        <ContentArea isOpen={isOpen}>
          <h1 className="text-3xl font-semiblod mb-4">メインコンテンツ</h1>
          <p>ここにメインコンテンツを表示する</p>
          <div className="container mx-auto p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {cards.map((card) => (
                <Card
                  key={card.id}
                  title={card.title}
                  description={card.description}
                />
              ))}
            </div>
          </div>
        </ContentArea>
        <ControlBox />
      </div>
    </>
  );
}

export default App;
