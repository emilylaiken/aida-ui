class UnpublishBot
  def self.run(bot)
    if bot.published?
      Backend.destroy_bot(bot.uuid)
      bot.uuid = nil
      bot.save!
    end

  rescue BackendError => e
    puts "Failed to unpublish bot: #{e}"
    e.errors.each do |error|
      puts " - #{error}"
    end
    nil
  end
end
