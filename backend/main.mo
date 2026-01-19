import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";

actor {
  type Message = {
    sender : Text;
    content : Text;
    timestamp : Time.Time;
    isCodeSnippet : Bool;
  };

  type Conversation = {
    id : Text;
    messages : [Message];
    topic : Text;
    startedAt : Time.Time;
  };

  type UserPreferences = {
    userId : Principal;
    theme : Text;
    notificationsEnabled : Bool;
  };

  type CodeExecutionResult = {
    code : Text;
    output : Text;
    success : Bool;
    timestamp : Time.Time;
  };

  module Message {
    public func compare(message1 : Message, message2 : Message) : Order.Order {
      Int.compare(message1.timestamp, message2.timestamp);
    };
  };

  module Conversation {
    public func compare(conversation1 : Conversation, conversation2 : Conversation) : Order.Order {
      Int.compare(conversation1.startedAt, conversation2.startedAt);
    };
  };

  module CodeExecutionResult {
    public func compare(result1 : CodeExecutionResult, result2 : CodeExecutionResult) : Order.Order {
      Int.compare(result1.timestamp, result2.timestamp);
    };
  };

  let conversations = Map.empty<Text, Conversation>();
  let userPreferences = Map.empty<Principal, UserPreferences>();
  let codeExecutionResults = Map.empty<Text, CodeExecutionResult>();

  public shared ({ caller }) func startConversation(topic : Text) : async Text {
    let conversationId = caller.toText() # "_" # Time.now().toText();
    let newConversation : Conversation = {
      id = conversationId;
      messages = [];
      topic;
      startedAt = Time.now();
    };
    conversations.add(conversationId, newConversation);
    conversationId;
  };

  public shared ({ caller }) func sendMessage(conversationId : Text, sender : Text, content : Text, isCodeSnippet : Bool) : async () {
    switch (conversations.get(conversationId)) {
      case (null) { Runtime.trap("Conversation not found") };
      case (?conversation) {
        let newMessage : Message = {
          sender;
          content;
          timestamp = Time.now();
          isCodeSnippet;
        };

        let updatedConversation : Conversation = {
          id = conversation.id;
          messages = conversation.messages.concat([newMessage]);
          topic = conversation.topic;
          startedAt = conversation.startedAt;
        };

        conversations.add(conversationId, updatedConversation);
      };
    };
  };

  public shared ({ caller }) func saveUserPreferences(theme : Text, notificationsEnabled : Bool) : async () {
    let preferences : UserPreferences = {
      userId = caller;
      theme;
      notificationsEnabled;
    };
    userPreferences.add(caller, preferences);
  };

  public shared ({ caller }) func getUserPreferences() : async UserPreferences {
    switch (userPreferences.get(caller)) {
      case (null) { Runtime.trap("No user preferences found") };
      case (?prefs) { prefs };
    };
  };

  public shared ({ caller }) func saveCodeExecutionResult(code : Text, output : Text, success : Bool) : async () {
    let resultId = Time.now().toText();
    let result : CodeExecutionResult = {
      code;
      output;
      success;
      timestamp = Time.now();
    };
    codeExecutionResults.add(resultId, result);
  };

  public shared ({ caller }) func getAllConversations() : async [Conversation] {
    conversations.values().toArray().sort();
  };

  public shared ({ caller }) func getConversationMessages(conversationId : Text) : async [Message] {
    switch (conversations.get(conversationId)) {
      case (null) { Runtime.trap("Conversation not found") };
      case (?conversation) { conversation.messages.sort() };
    };
  };

  public query ({ caller }) func getCodeExecutionResults() : async [CodeExecutionResult] {
    codeExecutionResults.values().toArray().sort();
  };

  public query ({ caller }) func getThemePreference() : async Text {
    switch (userPreferences.get(caller)) {
      case (null) { Runtime.trap("No user preferences found") };
      case (?prefs) { prefs.theme };
    };
  };
};
