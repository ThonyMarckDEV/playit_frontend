import React from 'react';
import { FriendshipProvider } from '../context/FriendshipContext';
import FriendsRequest from './FriendsRequest';

const Section = () => {
  return (
    <FriendshipProvider>
      <div className="mb-8">
        <FriendsRequest />
      </div>
    </FriendshipProvider>
  );
};

export default Section;