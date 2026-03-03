import { RealTimeChat } from './RealTimeChat';

export const ChatsPage = () => {
  return (
    // On mobile: break out of MainLayout's p-4 padding to go full-bleed,
    // use full remaining height (100vh minus 4rem header).
    // On desktop: restore normal margin, taller height accounting for sidebar padding.
    <div className="-m-4 md:m-0 h-[calc(100vh-4rem)] md:h-[calc(100vh-6rem)]">
      <RealTimeChat />
    </div>
  );
};
