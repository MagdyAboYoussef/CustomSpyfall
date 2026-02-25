const BUILTIN_LOCATIONS = [
  // ── Spyfall Classic ──────────────────────────────────────────────────────────
  {
    Location: 'Airplane', set: 'classic',
    Role1: 'Pilot', Role2: 'Co-Pilot', Role3: 'Flight Attendant',
    Role4: 'Passenger', Role5: 'Air Marshal', Role6: 'Mechanic',
    Role7: 'Baggage Handler', Role8: 'Boarding Agent', Role9: 'First Class Snob',
    Role10: 'Frequent Flyer', Role11: 'Nervous First-Timer', Role12: 'Middle Seat Victim',
    Role13: 'Crying Baby\'s Parent', Role14: 'Seat Recliner', Role15: 'Overhead Bin Hoarder', Role16: 'Immigration Officer'
  },
  {
    Location: 'Bank', set: 'classic',
    Role1: 'Bank Manager', Role2: 'Teller', Role3: 'Security Guard',
    Role4: 'Loan Officer', Role5: 'Customer', Role6: 'Robber',
    Role7: 'Vault Technician', Role8: 'Auditor', Role9: 'IT Specialist',
    Role10: 'Fraud Investigator', Role11: 'Janitor', Role12: 'Investment Advisor',
    Role13: 'Undercover Agent', Role14: 'Nervous First-Time Loan Applicant', Role15: 'Person Just Here to Break a $100', Role16: 'Mystery Safe Deposit Box Owner'
  },
  {
    Location: 'Beach', set: 'classic',
    Role1: 'Lifeguard', Role2: 'Surfer', Role3: 'Sunbather',
    Role4: 'Ice Cream Vendor', Role5: 'Volleyball Player', Role6: 'Scuba Diver',
    Role7: 'Parasailing Instructor', Role8: 'Beach Photographer', Role9: 'Marine Biologist',
    Role10: 'Jet Ski Operator', Role11: 'Metal Detectorist', Role12: 'Beach Patrol Officer',
    Role13: 'Sunburned Tourist', Role14: 'Seagull Victim', Role15: 'Food Truck Owner', Role16: 'Sandcastle Architect'
  },
  {
    Location: 'Broadway Theater', set: 'classic',
    Role1: 'Director', Role2: 'Lead Actor', Role3: 'Stage Manager',
    Role4: 'Costume Designer', Role5: 'Audience Member', Role6: 'Understudy',
    Role7: 'Set Designer', Role8: 'Lighting Technician', Role9: 'Sound Engineer',
    Role10: 'Choreographer', Role11: 'Makeup Artist', Role12: 'Ticket Seller',
    Role13: 'Props Master', Role14: 'Critic', Role15: 'Opening Night Nervous Wreck', Role16: 'Front Row Seat Stealer'
  },
  {
    Location: 'Casino', set: 'classic',
    Role1: 'Dealer', Role2: 'Pit Boss', Role3: 'High Roller',
    Role4: 'Cocktail Waitress', Role5: 'Security', Role6: 'Card Counter',
    Role7: 'Casino Manager', Role8: 'Croupier', Role9: 'Slot Technician',
    Role10: 'Surveillance Officer', Role11: 'Poker Champion', Role12: 'Cashier',
    Role13: 'Valet', Role14: 'Bartender', Role15: 'Compulsive Gambler on a Losing Streak', Role16: 'Person Who Came for the Free Drinks'
  },
  {
    Location: 'Cathedral', set: 'classic',
    Role1: 'Priest', Role2: 'Bishop', Role3: 'Nun',
    Role4: 'Choirboy', Role5: 'Wedding Guest', Role6: 'Tourist',
    Role7: 'Deacon', Role8: 'Organist', Role9: 'Acolyte',
    Role10: 'Bellringer', Role11: 'Pilgrim', Role12: 'Stained Glass Restorer',
    Role13: 'Confession Oversharer', Role14: 'Person Who Only Comes on Christmas', Role15: 'Reluctant Confirmation Student', Role16: 'Curious Atheist on a Tour'
  },
  {
    Location: 'Circus Tent', set: 'classic',
    Role1: 'Ringmaster', Role2: 'Acrobat', Role3: 'Clown',
    Role4: 'Lion Tamer', Role5: 'Tightrope Walker', Role6: 'Fire Breather',
    Role7: 'Magician', Role8: 'Contortionist', Role9: 'Strongman',
    Role10: 'Trapeze Artist', Role11: 'Juggler', Role12: 'Animal Trainer',
    Role13: 'Sword Swallower', Role14: 'Audience Volunteer Who Regrets It', Role15: 'Balloon Vendor', Role16: 'Stage Hand'
  },
  {
    Location: 'Corporate Party', set: 'classic',
    Role1: 'CEO', Role2: 'HR Manager', Role3: 'Intern',
    Role4: 'Finance Director', Role5: 'Party Planner', Role6: 'Caterer',
    Role7: 'Marketing Director', Role8: 'Sales VP', Role9: 'Board Member',
    Role10: 'IT Manager', Role11: 'Legal Counsel', Role12: 'Administrative Assistant',
    Role13: 'Security', Role14: 'Bartender', Role15: 'Person Who Wasn\'t Invited But Showed Up', Role16: 'Employee Already on Their Third Drink'
  },
  {
    Location: 'Crusader Army', set: 'classic',
    Role1: 'Knight', Role2: 'Archer', Role3: 'Squire',
    Role4: 'Siege Engineer', Role5: 'Field Surgeon', Role6: 'Camp Cook',
    Role7: 'Foot Soldier', Role8: 'Cavalry Commander', Role9: 'Chaplain',
    Role10: 'Crossbowman', Role11: 'Blacksmith', Role12: 'Spy',
    Role13: 'Quartermaster', Role14: 'Cowardly Deserter Who Got Caught', Role15: 'Reluctant Pilgrim', Role16: 'Lost Messenger'
  },
  {
    Location: 'Day Spa', set: 'classic',
    Role1: 'Massage Therapist', Role2: 'Receptionist', Role3: 'Aesthetician',
    Role4: 'Manicurist', Role5: 'Sauna Attendant', Role6: 'VIP Client',
    Role7: 'Nail Technician', Role8: 'Hair Stylist', Role9: 'Aromatherapist',
    Role10: 'Yoga Instructor', Role11: 'Personal Trainer', Role12: 'Nutritionist',
    Role13: 'Pedicurist', Role14: 'Gift Certificate Recipient Who\'s Never Been to a Spa', Role15: 'Man Dragged Here by Partner', Role16: 'First-Timer Who\'s Very Uncomfortable'
  },
  {
    Location: 'Embassy', set: 'classic',
    Role1: 'Ambassador', Role2: 'Consul', Role3: 'Security Officer',
    Role4: 'Translator', Role5: 'Visa Applicant', Role6: 'Intelligence Officer',
    Role7: 'Deputy Chief', Role8: 'Political Adviser', Role9: 'Press Attaché',
    Role10: 'Marine Guard', Role11: 'Diplomatic Courier', Role12: 'Cultural Attaché',
    Role13: 'Trade Representative', Role14: 'Journalist Staking It Out', Role15: 'Nervous Applicant Who Forgot Documents', Role16: 'Person Trying to Report a Stolen Passport'
  },
  {
    Location: 'Hospital', set: 'classic',
    Role1: 'Doctor', Role2: 'Nurse', Role3: 'Surgeon',
    Role4: 'Patient', Role5: 'Anesthesiologist', Role6: 'Emergency Physician',
    Role7: 'Paramedic', Role8: 'Radiologist', Role9: 'Pharmacist',
    Role10: 'Physical Therapist', Role11: 'Lab Technician', Role12: 'Orderly',
    Role13: 'Hypochondriac', Role14: 'Confused New Intern', Role15: 'Worried Parent in Waiting Room', Role16: 'Patient Who Self-Diagnosed on Google'
  },
  {
    Location: 'Hotel', set: 'classic',
    Role1: 'Concierge', Role2: 'Bellhop', Role3: 'Housekeeper',
    Role4: 'Front Desk Manager', Role5: 'Guest', Role6: 'Chef',
    Role7: 'Valet', Role8: 'Event Coordinator', Role9: 'Pool Attendant',
    Role10: 'Sommelier', Role11: 'Room Service Waiter', Role12: 'Head of Security',
    Role13: 'Maintenance Technician', Role14: 'VIP Guest', Role15: 'Person Checking In at 3am', Role16: 'Guest Who Left a 1-Star Review and Came Back Anyway'
  },
  {
    Location: 'Military Base', set: 'classic',
    Role1: 'General', Role2: 'Drill Sergeant', Role3: 'Soldier',
    Role4: 'Intelligence Officer', Role5: 'Mechanic', Role6: 'Cook',
    Role7: 'Sniper', Role8: 'Medic', Role9: 'Bomb Disposal Expert',
    Role10: 'Tank Commander', Role11: 'Military Police', Role12: 'Combat Pilot',
    Role13: 'Special Forces Operative', Role14: 'Base Commander', Role15: 'New Recruit on Day One', Role16: 'Soldier Counting Down the Days to Discharge'
  },
  {
    Location: 'Movie Studio', set: 'classic',
    Role1: 'Director', Role2: 'Lead Actor', Role3: 'Stunt Double',
    Role4: 'Cinematographer', Role5: 'Props Manager', Role6: 'Makeup Artist',
    Role7: 'Producer', Role8: 'Screenwriter', Role9: 'Sound Designer',
    Role10: 'Visual Effects Artist', Role11: 'Costume Designer', Role12: 'Casting Director',
    Role13: 'Gaffer', Role14: 'Script Supervisor', Role15: 'Film Editor', Role16: 'Actor Who Keeps Forgetting Lines'
  },
  {
    Location: 'Ocean Liner', set: 'classic',
    Role1: 'Captain', Role2: 'Navigator', Role3: 'Cruise Director',
    Role4: 'Passenger', Role5: 'Chef', Role6: 'Deckhand',
    Role7: 'First Officer', Role8: 'Entertainment Director', Role9: 'Purser',
    Role10: 'Casino Manager', Role11: 'Sommelier', Role12: 'Security Officer',
    Role13: 'Medical Officer', Role14: 'Engineer', Role15: 'Passenger Who\'s Seasick', Role16: 'Person Who Never Leaves the Buffet'
  },
  {
    Location: 'Passenger Train', set: 'classic',
    Role1: 'Conductor', Role2: 'Engineer', Role3: 'Ticket Inspector',
    Role4: 'Sleeping Car Attendant', Role5: 'Passenger', Role6: 'Stowaway',
    Role7: 'Station Master', Role8: 'Dining Car Chef', Role9: 'Porter',
    Role10: 'Rail Marshal', Role11: 'Train Dispatcher', Role12: 'Freight Supervisor',
    Role13: 'Snack Vendor', Role14: 'Rail Inspector', Role15: 'Person Who Missed Their Stop', Role16: 'Passenger Arguing About a Reserved Seat'
  },
  {
    Location: 'Pirate Ship', set: 'classic',
    Role1: 'Captain', Role2: 'First Mate', Role3: 'Navigator',
    Role4: 'Cannoneer', Role5: 'Cook', Role6: 'Prisoner',
    Role7: 'Boatswain', Role8: 'Lookout', Role9: 'Carpenter',
    Role10: 'Surgeon', Role11: 'Quartermaster', Role12: 'Deckhand',
    Role13: 'Gunner', Role14: 'Spy', Role15: 'Treasure Master', Role16: 'Cabin Boy'
  },
  {
    Location: 'Polar Station', set: 'classic',
    Role1: 'Expedition Leader', Role2: 'Climatologist', Role3: 'Meteorologist',
    Role4: 'Medic', Role5: 'Radio Operator', Role6: 'Dog Sled Driver',
    Role7: 'Glaciologist', Role8: 'Biologist', Role9: 'Engineer',
    Role10: 'Supply Officer', Role11: 'Ice Driller', Role12: 'Marine Biologist',
    Role13: 'Helicopter Pilot', Role14: 'Chef', Role15: 'Researcher Going Stir-Crazy', Role16: 'Person Who Lied About Tolerating Cold'
  },
  {
    Location: 'Police Station', set: 'classic',
    Role1: 'Police Chief', Role2: 'Detective', Role3: 'Patrol Officer',
    Role4: 'Forensic Analyst', Role5: 'Dispatcher', Role6: 'Suspect',
    Role7: 'Homicide Inspector', Role8: 'SWAT Commander', Role9: 'Undercover Agent',
    Role10: 'Crime Scene Technician', Role11: 'K9 Handler', Role12: 'Desk Sergeant',
    Role13: 'Evidence Clerk', Role14: 'Internal Affairs', Role15: 'Person Reporting a Missing Cat', Role16: 'Guy Disputing a Parking Ticket'
  },
  {
    Location: 'Restaurant', set: 'classic',
    Role1: 'Head Chef', Role2: 'Sous Chef', Role3: 'Waiter',
    Role4: 'Sommelier', Role5: 'Food Critic', Role6: 'Busboy',
    Role7: 'Pastry Chef', Role8: 'Host', Role9: 'Bartender',
    Role10: 'Manager', Role11: 'Line Cook', Role12: 'Dishwasher',
    Role13: 'Prep Cook', Role14: 'Mystery Diner', Role15: 'Table That\'s Been Waiting 45 Minutes', Role16: 'Person Who Sends Everything Back'
  },
  {
    Location: 'School', set: 'classic',
    Role1: 'Principal', Role2: 'Teacher', Role3: 'Student',
    Role4: 'Gym Coach', Role5: 'School Nurse', Role6: 'Janitor',
    Role7: 'Vice Principal', Role8: 'Librarian', Role9: 'Counselor',
    Role10: 'Art Teacher', Role11: 'Security Guard', Role12: 'Teacher\'s Pet',
    Role13: 'Class Clown', Role14: 'Exchange Student', Role15: 'Substitute Teacher Who Has Lost Control', Role16: 'Parent Causing Drama at the PTA Meeting'
  },
  {
    Location: 'Service Station', set: 'classic',
    Role1: 'Mechanic', Role2: 'Pump Attendant', Role3: 'Manager',
    Role4: 'Tow Truck Driver', Role5: 'Customer', Role6: 'Car Wash Worker',
    Role7: 'Tire Specialist', Role8: 'Auto Electrician', Role9: 'Oil Change Technician',
    Role10: 'Night Attendant', Role11: 'Apprentice Mechanic', Role12: 'Inspector',
    Role13: 'Detailer', Role14: 'Fuel Delivery Driver', Role15: 'Customer Who\'s Been Waiting 3 Hours', Role16: 'Person Who Ran Out of Gas Despite the Warnings'
  },
  {
    Location: 'Space Station', set: 'classic',
    Role1: 'Commander', Role2: 'Mission Specialist', Role3: 'Flight Engineer',
    Role4: 'Payload Specialist', Role5: 'Ground Control Liaison', Role6: 'Botanist',
    Role7: 'Flight Director', Role8: 'Robotics Expert', Role9: 'EVA Specialist',
    Role10: 'Medical Officer', Role11: 'Communications Officer', Role12: 'Research Scientist',
    Role13: 'Logistics Coordinator', Role14: 'Docking Pilot', Role15: 'Astronaut Terrified of Confined Spaces', Role16: 'Scientist Hoarding All the Snacks'
  },
  {
    Location: 'Submarine', set: 'classic',
    Role1: 'Captain', Role2: 'Sonar Operator', Role3: 'Torpedo Officer',
    Role4: 'Engineer', Role5: 'Cook', Role6: 'Navigator',
    Role7: 'Executive Officer', Role8: 'Weapons Officer', Role9: 'Medical Officer',
    Role10: 'Chief Petty Officer', Role11: 'Diving Officer', Role12: 'Communications Tech',
    Role13: 'Nuclear Reactor Operator', Role14: 'Lookout', Role15: 'New Recruit Who\'s Claustrophobic', Role16: 'Cook Complaining About the Kitchen Size'
  },
  {
    Location: 'Supermarket', set: 'classic',
    Role1: 'Store Manager', Role2: 'Cashier', Role3: 'Stock Boy',
    Role4: 'Butcher', Role5: 'Bakery Worker', Role6: 'Security Guard',
    Role7: 'Deli Worker', Role8: 'Produce Manager', Role9: 'Pharmacy Technician',
    Role10: 'Customer Service Rep', Role11: 'Loss Prevention Officer', Role12: 'Night Stocker',
    Role13: 'Fishmonger', Role14: 'Cart Collector', Role15: 'Person Arguing About an Expired Coupon', Role16: 'Shopper Who Came for One Thing and Left with a Full Cart'
  },
  {
    Location: 'University', set: 'classic',
    Role1: 'Professor', Role2: 'Graduate Student', Role3: 'Undergraduate',
    Role4: 'Dean', Role5: 'Librarian', Role6: 'Janitor',
    Role7: 'Registrar', Role8: 'Campus Security', Role9: 'Research Assistant',
    Role10: 'Athletics Coach', Role11: 'Academic Advisor', Role12: 'Lab Technician',
    Role13: 'Campus Tour Guide', Role14: 'IT Support', Role15: 'Student Who\'s Never Attended a Lecture', Role16: 'Professor Who Never Replies to Emails'
  },

  // ── Spyfall 2 ─────────────────────────────────────────────────────────────
  {
    Location: 'Amusement Park', set: 'spyfall2',
    Role1: 'Ride Operator', Role2: 'Park Manager', Role3: 'Food Vendor',
    Role4: 'Mascot', Role5: 'Thrill-Seeker', Role6: 'Maintenance Worker',
    Role7: 'Ticket Booth Worker', Role8: 'Security Guard', Role9: 'Game Booth Attendant',
    Role10: 'First Aid Attendant', Role11: 'Parade Performer', Role12: 'Balloon Artist',
    Role13: 'Carousel Operator', Role14: 'Lost & Found Officer', Role15: 'Person Who Got Stuck on a Ride', Role16: 'Child Crying Over the Height Requirement'
  },
  {
    Location: 'Art Museum', set: 'spyfall2',
    Role1: 'Curator', Role2: 'Art Restorer', Role3: 'Tour Guide',
    Role4: 'Security Guard', Role5: 'Patron', Role6: 'Struggling Artist',
    Role7: 'Gallery Director', Role8: 'Art Appraiser', Role9: 'Education Officer',
    Role10: 'Acquisitions Specialist', Role11: 'Conservationist', Role12: 'Auction Specialist',
    Role13: 'Intern', Role14: 'Gift Shop Manager', Role15: 'Person Who Doesn\'t Get Modern Art', Role16: 'Kid Who Accidentally Touched the Exhibit'
  },
  {
    Location: 'Candy Factory', set: 'spyfall2',
    Role1: 'Factory Manager', Role2: 'Chocolatier', Role3: 'Quality Taster',
    Role4: 'Machine Operator', Role5: 'Packaging Worker', Role6: 'Candy Inventor',
    Role7: 'Food Safety Inspector', Role8: 'Flavor Chemist', Role9: 'Marketing Manager',
    Role10: 'Supply Chain Manager', Role11: 'Shift Supervisor', Role12: 'Maintenance Engineer',
    Role13: 'Warehouse Worker', Role14: 'Transport Driver', Role15: 'Person Who\'s Eaten Way Too Much Today', Role16: 'Caramel Specialist'
  },
  {
    Location: 'Cat Show', set: 'spyfall2',
    Role1: 'Judge', Role2: 'Breeder', Role3: 'Groomer',
    Role4: 'Cat Owner', Role5: 'Spectator', Role6: 'Veterinarian',
    Role7: 'Show Organizer', Role8: 'Trophy Presenter', Role9: 'Photographer',
    Role10: 'Kitten Trainer', Role11: 'DNA Test Specialist', Role12: 'Cat Food Vendor',
    Role13: 'Commentator', Role14: 'Security', Role15: 'Extremely Competitive Cat Mom', Role16: 'Reluctant Owner Who Got Dragged Along'
  },
  {
    Location: 'Cemetery', set: 'spyfall2',
    Role1: 'Gravedigger', Role2: 'Funeral Director', Role3: 'Groundskeeper',
    Role4: 'Grieving Visitor', Role5: 'Ghost Tour Guide', Role6: 'Stone Carver',
    Role7: 'Mortician', Role8: 'Florist', Role9: 'Historian',
    Role10: 'Priest', Role11: 'Family Lawyer', Role12: 'Cemetery Manager',
    Role13: 'Coffin Maker', Role14: 'Security Guard', Role15: 'Goth Teen Who Just Hangs Out Here', Role16: 'Person Who Got Lost Looking for a Grave'
  },
  {
    Location: 'Coal Mine', set: 'spyfall2',
    Role1: 'Mine Foreman', Role2: 'Coal Miner', Role3: 'Safety Inspector',
    Role4: 'Explosives Expert', Role5: 'Canary Handler', Role6: 'Cart Pusher',
    Role7: 'Ventilation Engineer', Role8: 'Rock Driller', Role9: 'Hoist Operator',
    Role10: 'Geologist', Role11: 'Rescue Team Leader', Role12: 'Mine Surveyor',
    Role13: 'Coal Sorter', Role14: 'Mine Doctor', Role15: 'First Day Worker Who Already Regrets This', Role16: 'Miner Counting Days to Retirement'
  },
  {
    Location: 'Construction Site', set: 'spyfall2',
    Role1: 'Foreman', Role2: 'Crane Operator', Role3: 'Bricklayer',
    Role4: 'Electrician', Role5: 'Architect', Role6: 'Safety Inspector',
    Role7: 'Plumber', Role8: 'Welder', Role9: 'Site Engineer',
    Role10: 'Demolition Expert', Role11: 'Surveyor', Role12: 'Project Manager',
    Role13: 'Material Supplier', Role14: 'Concrete Mixer Operator', Role15: 'Worker on Phone the Entire Time', Role16: 'Guy Eating Lunch on a Beam 30 Stories Up'
  },
  {
    Location: 'Gaming Convention', set: 'spyfall2',
    Role1: 'Game Developer', Role2: 'Cosplayer', Role3: 'Tournament Referee',
    Role4: 'Merch Seller', Role5: 'Speed Runner', Role6: 'Casual Fan',
    Role7: 'Publisher Rep', Role8: 'Twitch Streamer', Role9: 'Voice Actor',
    Role10: 'Board Game Designer', Role11: 'Esports Coach', Role12: 'Convention Organizer',
    Role13: 'Artist Alley Creator', Role14: 'Media Journalist', Role15: 'Tournament Player Way Too Intense About This', Role16: 'Person in a Terrifyingly Detailed Costume'
  },
  {
    Location: 'Gas Station', set: 'spyfall2',
    Role1: 'Cashier', Role2: 'Mechanic', Role3: 'Manager',
    Role4: 'Trucker', Role5: 'Night Shift Attendant', Role6: 'Squeegee Kid',
    Role7: 'Car Wash Operator', Role8: 'Road Trip Traveler', Role9: 'Delivery Driver',
    Role10: 'Fuel Tanker Driver', Role11: 'Convenience Store Worker', Role12: 'Tire Repairman',
    Role13: 'Tow Truck Driver', Role14: 'Police Officer', Role15: 'Lost Tourist', Role16: 'Person Who Always Prepays Exact Change in Cash'
  },
  {
    Location: 'Harbor Docks', set: 'spyfall2',
    Role1: 'Harbormaster', Role2: 'Longshoreman', Role3: 'Customs Officer',
    Role4: 'Fisherman', Role5: 'Ferry Captain', Role6: 'Yacht Owner',
    Role7: 'Maritime Lawyer', Role8: 'Boat Mechanic', Role9: 'Port Security',
    Role10: 'Cargo Inspector', Role11: 'Sailing Instructor', Role12: 'Marine Biologist',
    Role13: 'Tugboat Captain', Role14: 'Naval Officer', Role15: 'Smuggler', Role16: 'Fisherman Who Never Catches Anything'
  },
  {
    Location: 'Ice Hockey Stadium', set: 'spyfall2',
    Role1: 'Goalie', Role2: 'Right Wing', Role3: 'Coach',
    Role4: 'Referee', Role5: 'Zamboni Driver', Role6: 'Die-Hard Fan',
    Role7: 'Team Captain', Role8: 'Defenseman', Role9: 'Equipment Manager',
    Role10: 'Sports Broadcaster', Role11: 'Stadium Security', Role12: 'Penalty Box Official',
    Role13: 'Physiotherapist', Role14: 'Scout', Role15: 'Fan Wearing the Wrong Team\'s Jersey', Role16: 'Person Here Just for the Nachos'
  },
  {
    Location: 'Jail', set: 'spyfall2',
    Role1: 'Warden', Role2: 'Guard', Role3: 'Prisoner',
    Role4: 'Lawyer', Role5: 'Chaplain', Role6: 'Parole Officer',
    Role7: 'Prison Doctor', Role8: 'Counselor', Role9: 'Corrections Officer',
    Role10: 'Undercover Cop', Role11: 'Gang Leader', Role12: 'Informant',
    Role13: 'Kitchen Worker', Role14: 'Prison Librarian', Role15: 'First-Timer Who\'s Absolutely Terrified', Role16: 'Lawyer Who Has Never Won a Case'
  },
  {
    Location: 'Jazz Club', set: 'spyfall2',
    Role1: 'Saxophone Player', Role2: 'Vocalist', Role3: 'Bartender',
    Role4: 'Club Owner', Role5: 'Jazz Critic', Role6: 'Regular Patron',
    Role7: 'Trumpet Player', Role8: 'Pianist', Role9: 'Drummer',
    Role10: 'Booking Agent', Role11: 'Sound Engineer', Role12: 'VIP Guest',
    Role13: 'Lighting Technician', Role14: 'Late-Night Cook', Role15: 'Person Who Came to the Wrong Bar', Role16: 'Someone Who Requested a Pop Song'
  },
  {
    Location: 'Library', set: 'spyfall2',
    Role1: 'Head Librarian', Role2: 'Archivist', Role3: 'Children\'s Librarian',
    Role4: 'IT Specialist', Role5: 'Bookworm', Role6: 'Quiet Rebel',
    Role7: 'Research Librarian', Role8: 'Volunteer', Role9: 'Rare Books Custodian',
    Role10: 'Interlibrary Loan Officer', Role11: 'Digital Resources Manager', Role12: 'Library Security',
    Role13: 'Local History Expert', Role14: 'Person Who Can\'t Find Their Book', Role15: 'Someone Who Keeps Getting Shushed', Role16: 'Person Here Just for the Air Conditioning'
  },
  {
    Location: 'Night Club', set: 'spyfall2',
    Role1: 'DJ', Role2: 'Bouncer', Role3: 'Bartender',
    Role4: 'VIP Guest', Role5: 'Promoter', Role6: 'Coat Check Attendant',
    Role7: 'Club Owner', Role8: 'Cocktail Waitress', Role9: 'Lighting Director',
    Role10: 'Limo Driver', Role11: 'Paparazzi', Role12: 'Underage Crasher',
    Role13: 'Social Media Influencer', Role14: 'Floor Manager', Role15: 'Person Who Came Alone and Regrets It', Role16: 'Someone Regretting Their Choice of Shoes'
  },
  {
    Location: 'Race Track', set: 'spyfall2',
    Role1: 'Race Car Driver', Role2: 'Pit Crew Chief', Role3: 'Race Engineer',
    Role4: 'Bookmaker', Role5: 'Commentator', Role6: 'Reckless Fan',
    Role7: 'Team Owner', Role8: 'Tire Specialist', Role9: 'Fueling Technician',
    Role10: 'Flagman', Role11: 'Track Marshal', Role12: 'Safety Car Driver',
    Role13: 'Sponsor Rep', Role14: 'Qualifying Official', Role15: 'Person Who Just Bet Their Savings', Role16: 'Driver Who Crashed on Lap One'
  },
  {
    Location: 'Retirement Home', set: 'spyfall2',
    Role1: 'Director', Role2: 'Nurse', Role3: 'Resident',
    Role4: 'Activities Coordinator', Role5: 'Visiting Grandchild', Role6: 'Physical Therapist',
    Role7: 'Social Worker', Role8: 'Chef', Role9: 'Night Supervisor',
    Role10: 'Occupational Therapist', Role11: 'Chaplain', Role12: 'Maintenance Worker',
    Role13: 'Laundry Staff', Role14: 'Weekend Volunteer', Role15: 'Resident Who Thinks It\'s Still 1965', Role16: 'Visiting Grandchild Who Came Out of Obligation'
  },
  {
    Location: 'Rock Concert', set: 'spyfall2',
    Role1: 'Lead Guitarist', Role2: 'Drummer', Role3: 'Tour Manager',
    Role4: 'Roadie', Role5: 'Groupie', Role6: 'Security Guard',
    Role7: 'Bass Player', Role8: 'Vocalist', Role9: 'Stage Manager',
    Role10: 'Lighting Tech', Role11: 'Sound Engineer', Role12: 'Merchandise Seller',
    Role13: 'Backstage Pass Holder', Role14: 'Music Journalist', Role15: 'Person Recording the Entire Concert on Their Phone', Role16: 'Guy Who\'s Too Tall Standing Right in Front'
  },
  {
    Location: 'Sightseeing Bus', set: 'spyfall2',
    Role1: 'Tour Guide', Role2: 'Bus Driver', Role3: 'Tourist',
    Role4: 'Local Historian', Role5: 'Pickpocket', Role6: 'Exchange Student',
    Role7: 'Travel Blogger', Role8: 'Guidebook Author', Role9: 'Sleepy Backpacker',
    Role10: 'Bus Mechanic', Role11: 'Corporate Tourist', Role12: 'Child on School Trip',
    Role13: 'Retired Traveler', Role14: 'Documentary Filmmaker', Role15: 'Tourist Who Asks Way Too Many Questions', Role16: 'Local Who Got on the Wrong Bus'
  },
  {
    Location: 'Stadium', set: 'spyfall2',
    Role1: 'Team Captain', Role2: 'Coach', Role3: 'Referee',
    Role4: 'Announcer', Role5: 'Hotdog Vendor', Role6: 'Die-Hard Fan',
    Role7: 'Sports Journalist', Role8: 'Team Mascot', Role9: 'Stadium Security',
    Role10: 'Ticket Scanner', Role11: 'Groundskeeper', Role12: 'Medical Staff',
    Role13: 'Talent Scout', Role14: 'Seat Usher', Role15: 'Fan Who Explains the Rules Wrong', Role16: 'Away Team Fan Who Sat in the Wrong Section'
  },
  {
    Location: 'Subway', set: 'spyfall2',
    Role1: 'Train Driver', Role2: 'Conductor', Role3: 'Busker',
    Role4: 'Commuter', Role5: 'Pickpocket', Role6: 'Station Manager',
    Role7: 'Ticket Inspector', Role8: 'Maintenance Worker', Role9: 'Platform Guard',
    Role10: 'Rush Hour Commuter', Role11: 'Tourist', Role12: 'Subway Artist',
    Role13: 'Lost Passenger', Role14: 'Transit Police', Role15: 'Person Eating a Full Hot Meal', Role16: 'Busker Who\'s Actually Pretty Bad'
  },
  {
    Location: 'The U.N.', set: 'spyfall2',
    Role1: 'Secretary-General', Role2: 'Ambassador', Role3: 'Interpreter',
    Role4: 'Security Officer', Role5: 'Journalist', Role6: 'Protester',
    Role7: 'Legal Counsel', Role8: 'Peacekeeping Commander', Role9: 'Human Rights Investigator',
    Role10: 'Head of State', Role11: 'Cultural Attaché', Role12: 'Communications Director',
    Role13: 'NGO Representative', Role14: 'Negotiator', Role15: 'Interpreter Who\'s Struggling', Role16: 'Diplomat Who Fell Asleep'
  },
  {
    Location: 'Vineyard', set: 'spyfall2',
    Role1: 'Winemaker', Role2: 'Sommelier', Role3: 'Harvest Worker',
    Role4: 'Tour Guide', Role5: 'Wine Critic', Role6: 'Cellar Master',
    Role7: 'Vineyard Owner', Role8: 'Grape Sorter', Role9: 'Wine Chemist',
    Role10: 'Estate Manager', Role11: 'Barrel Maker', Role12: 'Wine Educator',
    Role13: 'Restaurant Partner', Role14: 'Harvest Festival Coordinator', Role15: 'Tourist Here Purely for the Free Samples', Role16: 'Person Who Bought Way Too Many Bottles'
  },
  {
    Location: 'Wedding', set: 'spyfall2',
    Role1: 'Bride', Role2: 'Groom', Role3: 'Best Man',
    Role4: 'Maid of Honor', Role5: 'Wedding Planner', Role6: 'Officiant',
    Role7: 'Flower Girl', Role8: 'Ring Bearer', Role9: 'Catering Manager',
    Role10: 'Wedding Photographer', Role11: 'DJ', Role12: 'Florist',
    Role13: 'Drunk Uncle', Role14: 'Ex Who Was Accidentally Invited', Role15: 'Guest Who Only Came for the Open Bar', Role16: 'Crying Mother of the Bride'
  },
  {
    Location: 'Zoo', set: 'spyfall2',
    Role1: 'Zookeeper', Role2: 'Veterinarian', Role3: 'Tour Guide',
    Role4: 'Gift Shop Worker', Role5: 'Conservation Expert', Role6: 'School Child',
    Role7: 'Animal Nutritionist', Role8: 'Zoo Director', Role9: 'Education Officer',
    Role10: 'Reptile Specialist', Role11: 'Primate Handler', Role12: 'Safari Photographer',
    Role13: 'Volunteer', Role14: 'Zoo Architect', Role15: 'Child Trying to Feed the Animals Everything', Role16: 'Person Here Only for the Penguins'
  },
];

module.exports = BUILTIN_LOCATIONS;
