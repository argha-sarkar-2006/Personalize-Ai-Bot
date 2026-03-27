# A simple mock AI system that categorizes a site/task as productive or non-productive
def evaluate_activity(site_name: str) -> str:
    """
    Evaluates whether the site/app is considered 'Active' work or 'Inactive' distraction.
    Returns "Active" or "Inactive"
    """
    site_lower = site_name.lower()
    
    # Simple simulated logic for AI categorization
    distractions = ["youtube", "facebook", "twitter", "instagram", "netflix", "reddit"]
    
    for distraction in distractions:
        if distraction in site_lower:
            return "Inactive"
            
    return "Active"
