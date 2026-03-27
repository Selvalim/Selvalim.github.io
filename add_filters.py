import re

file_path = "/Users/xiaolin/Documents/GitHub/newhomepage/_pages/about.md"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

filter_ui = """
<div class="filter-controls" style="margin-bottom: 20px;">
  <button class="filter-btn active" data-filter="all">All</button>
  <button class="filter-btn" data-filter="selected">Selected Papers</button>
  <button class="filter-btn" data-filter="vis4fintech">Vis4FinTech</button>
  <button class="filter-btn" data-filter="llm-vis">LLM+Vis</button>
  <button class="filter-btn" data-filter="vis4domain">Vis4Domain</button>
</div>

<style>
.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.filter-btn {
  padding: 8px 16px;
  border: 1px solid #c12c1f;
  background-color: transparent;
  color: #c12c1f;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}
.filter-btn:hover {
  background-color: rgba(193, 44, 31, 0.1);
}
.filter-btn.active {
  background-color: #c12c1f;
  color: white;
}
</style>

<script>
document.addEventListener("DOMContentLoaded", function() {
  const buttons = document.querySelectorAll('.filter-btn');
  const papers = document.querySelectorAll('.paper-box');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      buttons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      button.classList.add('active');

      const filter = button.getAttribute('data-filter');

      papers.forEach(paper => {
        if (filter === 'all') {
          paper.style.display = 'flex'; // Assuming paper-box uses flex or block. If it breaks, try empty string ''
        } else {
          const categories = paper.getAttribute('data-categories') || '';
          if (categories.includes(filter)) {
            paper.style.display = 'flex';
          } else {
            paper.style.display = 'none';
          }
        }
      });
    });
  });
});
</script>
"""

# Categorization logic
def categorize(html_block):
    cat = []
    
    # Selected criteria based on paper title or image source
    if any(k in html_block for k in ['CotVis', 'Athanor', 'PrettiSmart', 'LLM-DesignStudy', 'envisage', 'PonziLens+', 'NFTDisk']):
        cat.append('selected')
        
    if any(k in html_block for k in ['CotVis', 'Athanor', 'LLM-DesignStudy']):
        cat.append('llm-vis')
        
    if any(k in html_block for k in ['PrettiSmart', 'PonziLens+', 'NFTDisk', 'codewilltell', 'EOS']):
        cat.append('vis4fintech')
        
    if any(k in html_block for k in ['FuzzSurvey', 'envisage', 'IntelliCircos', 'VIOLET', 'diffseer', 'warehouselens', 'triplan', 'MDVis', 'MulUBA']):
        cat.append('vis4domain')
        
    return " ".join(cat)

# We will split the content at "# 📝 Publications "
parts = content.split("# 📝 Publications")
if len(parts) == 2:
    before = parts[0]
    after = parts[1]
    
    # insert filter ui
    after = "\n" + filter_ui + "\n" + after
    
    # Find all paper boxes and inject data-categories
    # The paper box starts with <div class='paper-box'>
    
    def replacer(match):
        full_match = match.group(0)
        # Find category
        cat = categorize(full_match)
        # Insert data-categories
        return full_match.replace("<div class='paper-box'>", f"<div class='paper-box' data-categories='{cat}'>", 1)
        
    # Regex to match a whole paper-box div until the next <div class='paper-box'> or end of section (#)
    # Actually, we can just replace <div class='paper-box'> with the corresponding category by finding the block.
    # A safer way is to split by <div class='paper-box'>
    
    boxes = after.split("<div class='paper-box'>")
    
    new_after = boxes[0] # everything before the first box
    for i in range(1, len(boxes)):
        box_content = boxes[i]
        cat = categorize(box_content)
        new_after += f"<div class='paper-box' data-categories='{cat}'>" + box_content

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(before + "# 📝 Publications" + new_after)
    print("Successfully modified file.")
else:
    print("Could not find '# 📝 Publications'")

