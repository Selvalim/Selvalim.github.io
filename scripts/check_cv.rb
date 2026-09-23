require 'nokogiri'

root = ARGV.fetch(0, '_site')
home = Nokogiri::HTML(File.read(File.join(root, 'index.html')))
cv = Nokogiri::HTML(File.read(File.join(root, 'cv/index.html')))
normalize = ->(text) { text.gsub(/\s+/, ' ').strip }
home_titles = home.css('.paper-box-text > p:first-child a').map { |a| normalize.call(a.text) }
cv_titles = cv.css('.cv-publication > p:first-child a').map { |a| normalize.call(a.text) }
raise 'CV publications differ from the homepage' unless home_titles.sort == cv_titles.sort && home_titles.any?
raise 'Homepage content leaked into CV' unless cv.css('h1').length == 1 && cv.css('.paper-box, .news-card, script#mapmyvisitors').empty?
raise 'Phone number must remain private' if cv.text.match?(/9892\s*7790/)
raise 'Paper links must resolve outside /cv/' if cv.css('.cv-publication a').any? { |a| a['href'].start_with?('./') }
expected_lists = { 'Education' => '-educations', 'Research Experience' => '-internships', 'Honors & Awards' => '-honors-and-awards', 'Teaching Experience' => '-teaching-experience', 'Invited Talks' => '-invited-talks' }
expected_lists.each do |title, id|
  heading = home.at_css("h1[id='#{id}']")
  raise "Missing homepage section #{id}" unless heading
  count = heading.next_element.css('> li').length
  section = cv.css('.cv-section').find { |s| s.at_css('h2')&.text == title }
  raise "Invalid #{title} extraction" unless count.positive? && section && section.css('> ul > li').length == count
end
raise 'CV must open in a new tab' unless home.at_css('a[href="/cv/"][target="_blank"]')
puts "CV checks passed: #{cv_titles.length} papers, shared sections, public contacts, and navigation."
