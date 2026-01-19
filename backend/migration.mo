import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type OldMessage = {
    sender : Text;
    content : Text;
    timestamp : Int;
    isCodeSnippet : Bool;
  };

  type OldConversation = {
    id : Text;
    messages : [OldMessage];
    topic : Text;
    startedAt : Int;
  };

  type OldUserPreferences = {
    userId : Principal;
    theme : Text;
    notificationsEnabled : Bool;
  };

  type OldCodeExecutionResult = {
    code : Text;
    output : Text;
    success : Bool;
    timestamp : Int;
  };

  type OldActor = {
    conversations : Map.Map<Text, OldConversation>;
    userPreferences : Map.Map<Principal, OldUserPreferences>;
    codeExecutionResults : Map.Map<Text, OldCodeExecutionResult>;
  };

  type NewMessage = OldMessage;

  type NewConversation = {
    id : Text;
    messages : [NewMessage];
    topic : Text;
    startedAt : Int;
    owner : Principal;
  };

  type NewUserPreferences = {
    userId : Principal;
    theme : Text;
    notificationsEnabled : Bool;
    voiceModeEnabled : Bool;
  };

  type NewCodeExecutionResult = {
    code : Text;
    output : Text;
    success : Bool;
    timestamp : Int;
    owner : Principal;
  };

  type NewActor = {
    conversations : Map.Map<Text, NewConversation>;
    userPreferences : Map.Map<Principal, NewUserPreferences>;
    codeExecutionResults : Map.Map<Text, NewCodeExecutionResult>;
  };

  public func run(old : OldActor) : NewActor {
    let newConversations = old.conversations.map<Text, OldConversation, NewConversation>(
      func(_text, oldConversation) {
        { oldConversation with owner = Principal.fromText("anonymous") };
      }
    );

    let newUserPreferences = old.userPreferences.map<Principal, OldUserPreferences, NewUserPreferences>(
      func(_principal, oldPrefs) {
        { oldPrefs with voiceModeEnabled = false };
      }
    );

    let newCodeExecutionResults = old.codeExecutionResults.map<Text, OldCodeExecutionResult, NewCodeExecutionResult>(
      func(_text, oldResult) {
        { oldResult with owner = Principal.fromText("anonymous") };
      }
    );

    {
      old with
      conversations = newConversations;
      userPreferences = newUserPreferences;
      codeExecutionResults = newCodeExecutionResults;
    };
  };
};
