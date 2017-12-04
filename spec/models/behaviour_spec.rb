require 'rails_helper'

RSpec.describe Behaviour, type: :model do
  let!(:bot) { Bot.create_prepared!(User.create email: 'foo@example.com')}

  describe "front_desk" do
    it "creates valid behaviour" do
      front_desk = bot.behaviours.create_front_desk!
      expect(front_desk).to be_valid
    end

    it "generates manifest fragment" do
      fragment = bot.front_desk.manifest_fragment
      expect(fragment).to_not be_nil
      expect(fragment.keys).to match_array(%i(greeting introduction clarification not_understood threshold))
    end
  end

  describe "keyword_responder" do
    it "creates valid and enabled skill" do
      responder = bot.skills.create_skill!('keyword_responder')
      expect(responder).to be_valid
      expect(responder).to be_enabled
    end

    it "generates manifest fragment" do
      responder = bot.skills.create_skill!('keyword_responder')
      fragment = responder.manifest_fragment
      expect(fragment).to_not be_nil
      expect(fragment.keys).to match_array(%i(type id name explanation keywords response clarification))
    end
  end

  describe "language_detector" do
    it "creates valid skill" do
      detector = bot.skills.create_skill!('language_detector')
      expect(detector).to be_valid
      expect(detector).to be_enabled
    end

    it "generates manifest fragment" do
      detector = bot.skills.create_skill!('language_detector')
      fragment = detector.manifest_fragment
      expect(fragment).to_not be_nil
      expect(fragment.keys).to match_array(%i(type explanation languages))
    end
  end
end