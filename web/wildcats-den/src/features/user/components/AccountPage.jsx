import React from "react";
import ProfileDetails from "./ProfileDetails";
import ExtendProfile from "./ExtendProfile";
import BookingHistory from "../../booking/components/BookingHistory";
import "../styles/AccountLayout.css";


export default function AccountPage() {

  return (
    <div className="account-layout">
      <div className="account-columns">
        <ProfileDetails />
        <ExtendProfile isEditing={false} />
        <BookingHistory />
      </div>
    </div>
  );
}