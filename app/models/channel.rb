class Channel < ApplicationRecord
  belongs_to :bot

  validates :name, presence: true
  validates :kind, inclusion: { in: %w(facebook) }

  validate :config_must_match_schema

  scope :of_bots_owned_by, -> (user) { Channel.where(bot: user.bots) }

  def setup?
    config["page_id"].present? &&
    config["verify_token"].present? &&
    config["access_token"].present?
  end

  private

  def config_must_match_schema
    unless JSON::Validator.validate(schema_file, config, fragment: config_schema_fragment)
      errors.add(:config, "does not match schema")
    end
  end

  def schema_file
    Rails.root.join("app", "schemas", "types.json").read
  end

  def config_schema_fragment
    case kind
    when "facebook"
      "#/definitions/facebookChannelConfig"
    else
      fail "config schema not defined"
    end
  end
end
