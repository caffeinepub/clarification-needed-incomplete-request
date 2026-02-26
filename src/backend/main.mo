import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Types
  public type Watch = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat; // USD cents, to be converted to BTC client-side
    published : Bool;
    image : Storage.ExternalBlob;
  };

  public type OrderStatus = {
    #pending;
    #confirmed;
    #completed;
    #cancelled;
  };

  public type Order = {
    id : Nat;
    customerName : Text;
    contactInfo : Text; // Email or phone
    watchId : Nat;
    note : Text;
    status : OrderStatus;
    timestamp : Int;
  };

  public type ChatMessage = {
    id : Nat;
    senderName : Text;
    message : Text;
    image : ?Storage.ExternalBlob;
    replies : [ChatMessage];
    timestamp : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  // Storage
  var nextWatchId = 1;
  var nextOrderId = 1;
  var nextMessageId = 1;

  let watches = Map.empty<Nat, Watch>();
  let orders = Map.empty<Nat, Order>();
  let messages = Map.empty<Nat, ChatMessage>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // WATCH CATALOG (admin only)
  public shared ({ caller }) func addWatch(
    name : Text,
    description : Text,
    price : Nat,
    image : Storage.ExternalBlob,
  ) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let id = nextWatchId;
    nextWatchId += 1;

    let watch : Watch = {
      id;
      name;
      description;
      price;
      published = false;
      image;
    };

    watches.add(id, watch);
    id;
  };

  public shared ({ caller }) func updateWatch(
    id : Nat,
    name : Text,
    description : Text,
    price : Nat,
    published : Bool,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (watches.get(id)) {
      case (null) { Runtime.trap("Watch not found") };
      case (?watch) {
        let updatedWatch : Watch = {
          watch with
          name;
          description;
          price;
          published;
        };
        watches.add(id, updatedWatch);
      };
    };
  };

  public shared ({ caller }) func deleteWatch(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not watches.containsKey(id)) {
      Runtime.trap("Watch not found");
    };
    watches.remove(id);
  };

  public query ({ caller }) func getWatches() : async [Watch] {
    watches.values().toArray().filter(
      func(w) {
        (w.published or AccessControl.isAdmin(accessControlState, caller));
      }
    );
  };

  public query ({ caller }) func getWatchById(id : Nat) : async Watch {
    let watch = watches.get(id);
    switch (watch) {
      case (null) { Runtime.trap("Watch not found") };
      case (?w) {
        if (not w.published and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only admins can view unpublished watches");
        };
        w;
      };
    };
  };

  // ORDERS (public)
  public shared ({ caller }) func placeOrder(
    customerName : Text,
    contactInfo : Text,
    watchId : Nat,
    note : Text,
  ) : async Nat {
    if (customerName == "" or contactInfo == "") {
      Runtime.trap("Missing required fields");
    };

    switch (watches.get(watchId)) {
      case (null) { Runtime.trap("Watch not found") };
      case (?_) {
        let id = nextOrderId;
        nextOrderId += 1;

        let order : Order = {
          id;
          customerName;
          contactInfo;
          watchId;
          note;
          status = #pending;
          timestamp = Time.now();
        };

        orders.add(id, order);
        id;
      };
    };
  };

  public query ({ caller }) func getOrders() : async [Order] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : OrderStatus) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder = { order with status };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  // CHAT MESSAGES (public + admin)
  public shared ({ caller }) func sendMessage(
    senderName : Text,
    message : Text,
    image : ?Storage.ExternalBlob,
  ) : async Nat {
    if (senderName == "" or message == "") {
      Runtime.trap("Missing required fields");
    };

    let id = nextMessageId;
    nextMessageId += 1;

    let chat : ChatMessage = {
      id;
      senderName;
      message;
      image;
      replies = [];
      timestamp = Time.now();
    };

    messages.add(id, chat);
    id;
  };

  public query ({ caller }) func getAllMessages() : async [ChatMessage] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all messages");
    };
    messages.values().toArray();
  };

  public shared ({ caller }) func replyToMessage(
    messageId : Nat,
    replyText : Text,
  ) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (messages.get(messageId)) {
      case (null) { Runtime.trap("Message not found") };
      case (?parentMessage) {
        let replyId = nextMessageId;
        nextMessageId += 1;

        let reply : ChatMessage = {
          id = replyId;
          senderName = "Admin";
          message = replyText;
          image = null;
          replies = [];
          timestamp = Time.now();
        };

        let updatedParent = {
          parentMessage with
          replies = parentMessage.replies.concat([reply]);
        };

        messages.add(messageId, updatedParent);
        replyId;
      };
    };
  };
};
