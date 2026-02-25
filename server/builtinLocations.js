const BUILTIN_LOCATIONS = [
  // ── Spyfall Classic ──────────────────────────────────────────────────────────
  {
    Location: 'Airplane', set: 'classic',
    Role1: 'Pilot', Role2: 'Co-Pilot', Role3: 'Flight Attendant',
    Role4: 'Passenger', Role5: 'Air Marshal', Role6: 'Mechanic',
    Role7: 'Baggage Handler', Role8: 'Navigator', Role9: 'Purser',
    Role10: 'First Class Passenger', Role11: 'Cargo Inspector', Role12: 'Boarding Agent',
    Role13: 'Fuel Technician', Role14: 'Catering Staff', Role15: 'Aircraft Cleaner', Role16: 'Immigration Officer'
  },
  {
    Location: 'Bank', set: 'classic',
    Role1: 'Bank Manager', Role2: 'Teller', Role3: 'Security Guard',
    Role4: 'Loan Officer', Role5: 'Customer', Role6: 'Robber',
    Role7: 'Auditor', Role8: 'IT Specialist', Role9: 'Vault Technician',
    Role10: 'Investment Advisor', Role11: 'Undercover Agent', Role12: 'Janitor',
    Role13: 'ATM Technician', Role14: 'Fraud Investigator', Role15: 'Money Counter', Role16: 'Branch Director'
  },
  {
    Location: 'Beach', set: 'classic',
    Role1: 'Lifeguard', Role2: 'Surfer', Role3: 'Sunbather',
    Role4: 'Ice Cream Vendor', Role5: 'Volleyball Player', Role6: 'Sandcastle Builder',
    Role7: 'Scuba Diver', Role8: 'Parasailing Instructor', Role9: 'Beach Photographer',
    Role10: 'Jet Ski Operator', Role11: 'Shell Collector', Role12: 'Marine Biologist',
    Role13: 'Beach Patrol Officer', Role14: 'Food Truck Owner', Role15: 'Kitesurfer', Role16: 'Metal Detectorist'
  },
  {
    Location: 'Broadway Theater', set: 'classic',
    Role1: 'Director', Role2: 'Lead Actor', Role3: 'Stage Manager',
    Role4: 'Costume Designer', Role5: 'Audience Member', Role6: 'Understudy',
    Role7: 'Set Designer', Role8: 'Lighting Technician', Role9: 'Sound Engineer',
    Role10: 'Choreographer', Role11: 'Makeup Artist', Role12: 'Ticket Seller',
    Role13: 'Props Master', Role14: 'Critic', Role15: 'Playwright', Role16: 'Drama Coach'
  },
  {
    Location: 'Casino', set: 'classic',
    Role1: 'Dealer', Role2: 'Pit Boss', Role3: 'High Roller',
    Role4: 'Cocktail Waitress', Role5: 'Security', Role6: 'Card Counter',
    Role7: 'Casino Manager', Role8: 'Croupier', Role9: 'Slot Technician',
    Role10: 'Surveillance Officer', Role11: 'Poker Champion', Role12: 'Cashier',
    Role13: 'Valet', Role14: 'Bartender', Role15: 'Chip Runner', Role16: 'Host'
  },
  {
    Location: 'Cathedral', set: 'classic',
    Role1: 'Priest', Role2: 'Bishop', Role3: 'Nun',
    Role4: 'Choirboy', Role5: 'Wedding Guest', Role6: 'Tourist',
    Role7: 'Deacon', Role8: 'Organist', Role9: 'Sacristan',
    Role10: 'Acolyte', Role11: 'Stained Glass Restorer', Role12: 'Bellringer',
    Role13: 'Canon', Role14: 'Verger', Role15: 'Sexton', Role16: 'Pilgrim'
  },
  {
    Location: 'Circus Tent', set: 'classic',
    Role1: 'Ringmaster', Role2: 'Acrobat', Role3: 'Clown',
    Role4: 'Lion Tamer', Role5: 'Tightrope Walker', Role6: 'Fire Breather',
    Role7: 'Magician', Role8: 'Contortionist', Role9: 'Strongman',
    Role10: 'Trapeze Artist', Role11: 'Juggler', Role12: 'Animal Trainer',
    Role13: 'Sword Swallower', Role14: 'Illusionist', Role15: 'Stage Hand', Role16: 'Ticket Seller'
  },
  {
    Location: 'Corporate Party', set: 'classic',
    Role1: 'CEO', Role2: 'HR Manager', Role3: 'Intern',
    Role4: 'Finance Director', Role5: 'Party Planner', Role6: 'Caterer',
    Role7: 'Marketing Director', Role8: 'Sales VP', Role9: 'Board Member',
    Role10: 'IT Manager', Role11: 'Legal Counsel', Role12: 'Administrative Assistant',
    Role13: 'Security', Role14: 'Bartender', Role15: 'Photographer', Role16: 'DJ'
  },
  {
    Location: 'Crusader Army', set: 'classic',
    Role1: 'Knight', Role2: 'Archer', Role3: 'Squire',
    Role4: 'Siege Engineer', Role5: 'Field Surgeon', Role6: 'Camp Cook',
    Role7: 'Foot Soldier', Role8: 'Cavalry Commander', Role9: 'Chaplain',
    Role10: 'Herald', Role11: 'Map Maker', Role12: 'Crossbowman',
    Role13: 'Blacksmith', Role14: 'Spy', Role15: 'Standard Bearer', Role16: 'Quartermaster'
  },
  {
    Location: 'Day Spa', set: 'classic',
    Role1: 'Massage Therapist', Role2: 'Receptionist', Role3: 'Aesthetician',
    Role4: 'Manicurist', Role5: 'Sauna Attendant', Role6: 'VIP Client',
    Role7: 'Nail Technician', Role8: 'Hair Stylist', Role9: 'Aromatherapist',
    Role10: 'Yoga Instructor', Role11: 'Hydrotherapist', Role12: 'Pedicurist',
    Role13: 'Waxing Specialist', Role14: 'Facial Specialist', Role15: 'Personal Trainer', Role16: 'Nutritionist'
  },
  {
    Location: 'Embassy', set: 'classic',
    Role1: 'Ambassador', Role2: 'Consul', Role3: 'Cultural Attaché',
    Role4: 'Security Officer', Role5: 'Translator', Role6: 'Visa Applicant',
    Role7: 'Deputy Chief', Role8: 'Political Adviser', Role9: 'Intelligence Officer',
    Role10: 'Press Attaché', Role11: 'Communications Officer', Role12: 'Consular Officer',
    Role13: 'Marine Guard', Role14: 'Administrative Assistant', Role15: 'Trade Representative', Role16: 'Diplomatic Courier'
  },
  {
    Location: 'Hospital', set: 'classic',
    Role1: 'Doctor', Role2: 'Nurse', Role3: 'Surgeon',
    Role4: 'Patient', Role5: 'Anesthesiologist', Role6: 'Orderly',
    Role7: 'Emergency Physician', Role8: 'Radiologist', Role9: 'Pharmacist',
    Role10: 'Physical Therapist', Role11: 'Hospital Administrator', Role12: 'Lab Technician',
    Role13: 'Cardiologist', Role14: 'Paramedic', Role15: 'Social Worker', Role16: 'Medical Intern'
  },
  {
    Location: 'Hotel', set: 'classic',
    Role1: 'Concierge', Role2: 'Bellhop', Role3: 'Housekeeper',
    Role4: 'Front Desk Manager', Role5: 'Guest', Role6: 'Chef',
    Role7: 'Valet', Role8: 'Night Auditor', Role9: 'Event Coordinator',
    Role10: 'Pool Attendant', Role11: 'Sommelier', Role12: 'Room Service Waiter',
    Role13: 'Head of Security', Role14: 'Maintenance Technician', Role15: 'Spa Manager', Role16: 'VIP Guest'
  },
  {
    Location: 'Military Base', set: 'classic',
    Role1: 'General', Role2: 'Drill Sergeant', Role3: 'Soldier',
    Role4: 'Intelligence Officer', Role5: 'Mechanic', Role6: 'Cook',
    Role7: 'Sniper', Role8: 'Medic', Role9: 'Communications Officer',
    Role10: 'Bomb Disposal Expert', Role11: 'Tank Commander', Role12: 'Logistics Officer',
    Role13: 'Military Police', Role14: 'Combat Pilot', Role15: 'Special Forces Operative', Role16: 'Base Commander'
  },
  {
    Location: 'Movie Studio', set: 'classic',
    Role1: 'Director', Role2: 'Lead Actor', Role3: 'Stunt Double',
    Role4: 'Cinematographer', Role5: 'Props Manager', Role6: 'Makeup Artist',
    Role7: 'Producer', Role8: 'Screenwriter', Role9: 'Sound Designer',
    Role10: 'Visual Effects Artist', Role11: 'Costume Designer', Role12: 'Casting Director',
    Role13: 'Gaffer', Role14: 'Script Supervisor', Role15: 'Film Editor', Role16: 'Set Decorator'
  },
  {
    Location: 'Ocean Liner', set: 'classic',
    Role1: 'Captain', Role2: 'Navigator', Role3: 'Cruise Director',
    Role4: 'Passenger', Role5: 'Chef', Role6: 'Deckhand',
    Role7: 'First Officer', Role8: 'Entertainment Director', Role9: 'Purser',
    Role10: 'Casino Manager', Role11: 'Sommelier', Role12: 'Security Officer',
    Role13: 'Medical Officer', Role14: 'Engineer', Role15: 'Spa Director', Role16: 'Excursion Guide'
  },
  {
    Location: 'Passenger Train', set: 'classic',
    Role1: 'Conductor', Role2: 'Engineer', Role3: 'Ticket Inspector',
    Role4: 'Sleeping Car Attendant', Role5: 'Passenger', Role6: 'Stowaway',
    Role7: 'Station Master', Role8: 'Dining Car Chef', Role9: 'Porter',
    Role10: 'Rail Marshal', Role11: 'Locomotive Fireman', Role12: 'Train Dispatcher',
    Role13: 'Maintenance Crew', Role14: 'Freight Supervisor', Role15: 'Snack Vendor', Role16: 'Rail Inspector'
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
    Role10: 'Geographer', Role11: 'Supply Officer', Role12: 'Ice Driller',
    Role13: 'Marine Biologist', Role14: 'Helicopter Pilot', Role15: 'Science Officer', Role16: 'Chef'
  },
  {
    Location: 'Police Station', set: 'classic',
    Role1: 'Police Chief', Role2: 'Detective', Role3: 'Patrol Officer',
    Role4: 'Forensic Analyst', Role5: 'Dispatcher', Role6: 'Suspect',
    Role7: 'Homicide Inspector', Role8: 'SWAT Commander', Role9: 'Undercover Agent',
    Role10: 'Crime Scene Technician', Role11: 'K9 Handler', Role12: 'Desk Sergeant',
    Role13: 'Victim Advocate', Role14: 'Evidence Clerk', Role15: 'Liaison Officer', Role16: 'Internal Affairs'
  },
  {
    Location: 'Restaurant', set: 'classic',
    Role1: 'Head Chef', Role2: 'Sous Chef', Role3: 'Waiter',
    Role4: 'Sommelier', Role5: 'Food Critic', Role6: 'Busboy',
    Role7: 'Pastry Chef', Role8: 'Host', Role9: 'Bartender',
    Role10: 'Manager', Role11: 'Line Cook', Role12: 'Dishwasher',
    Role13: 'Prep Cook', Role14: 'Wine Steward', Role15: 'Event Coordinator', Role16: 'Mystery Diner'
  },
  {
    Location: 'School', set: 'classic',
    Role1: 'Principal', Role2: 'Teacher', Role3: 'Student',
    Role4: 'Gym Coach', Role5: 'School Nurse', Role6: 'Janitor',
    Role7: 'Vice Principal', Role8: 'Librarian', Role9: 'Counselor',
    Role10: 'Art Teacher', Role11: 'Math Teacher', Role12: 'Special Education Aide',
    Role13: 'Parent Volunteer', Role14: 'Security Guard', Role15: 'Science Teacher', Role16: 'School Board Member'
  },
  {
    Location: 'Service Station', set: 'classic',
    Role1: 'Mechanic', Role2: 'Pump Attendant', Role3: 'Manager',
    Role4: 'Tow Truck Driver', Role5: 'Customer', Role6: 'Car Wash Worker',
    Role7: 'Tire Specialist', Role8: 'Auto Electrician', Role9: 'Oil Change Technician',
    Role10: 'Auto Parts Supplier', Role11: 'Road Assistance Officer', Role12: 'Inspector',
    Role13: 'Night Attendant', Role14: 'Apprentice Mechanic', Role15: 'Fuel Delivery Driver', Role16: 'Detailer'
  },
  {
    Location: 'Space Station', set: 'classic',
    Role1: 'Commander', Role2: 'Mission Specialist', Role3: 'Flight Engineer',
    Role4: 'Payload Specialist', Role5: 'Ground Control Liaison', Role6: 'Botanist',
    Role7: 'Flight Director', Role8: 'Robotics Expert', Role9: 'Systems Engineer',
    Role10: 'EVA Specialist', Role11: 'Medical Officer', Role12: 'Communications Officer',
    Role13: 'Research Scientist', Role14: 'Logistics Coordinator', Role15: 'Habitat Manager', Role16: 'Docking Pilot'
  },
  {
    Location: 'Submarine', set: 'classic',
    Role1: 'Captain', Role2: 'Sonar Operator', Role3: 'Torpedo Officer',
    Role4: 'Engineer', Role5: 'Cook', Role6: 'Navigator',
    Role7: 'Executive Officer', Role8: 'Weapons Officer', Role9: 'Medical Officer',
    Role10: 'Chief Petty Officer', Role11: 'Diving Officer', Role12: 'Communications Tech',
    Role13: 'Nuclear Reactor Operator', Role14: 'Ballast Control Officer', Role15: 'Lookout', Role16: 'Seaman'
  },
  {
    Location: 'Supermarket', set: 'classic',
    Role1: 'Store Manager', Role2: 'Cashier', Role3: 'Stock Boy',
    Role4: 'Butcher', Role5: 'Bakery Worker', Role6: 'Security Guard',
    Role7: 'Deli Worker', Role8: 'Produce Manager', Role9: 'Pharmacy Technician',
    Role10: 'Customer Service Rep', Role11: 'Loss Prevention Officer', Role12: 'Night Stocker',
    Role13: 'Floral Designer', Role14: 'Fishmonger', Role15: 'Self-Checkout Supervisor', Role16: 'Cart Collector'
  },
  {
    Location: 'University', set: 'classic',
    Role1: 'Professor', Role2: 'Graduate Student', Role3: 'Undergraduate',
    Role4: 'Dean', Role5: 'Librarian', Role6: 'Janitor',
    Role7: 'Registrar', Role8: 'Campus Security', Role9: 'Research Assistant',
    Role10: 'Athletics Coach', Role11: 'Financial Aid Officer', Role12: 'Academic Advisor',
    Role13: 'Lab Technician', Role14: 'Campus Tour Guide', Role15: 'IT Support', Role16: 'Cafeteria Manager'
  },

  // ── Spyfall 2 ─────────────────────────────────────────────────────────────
  {
    Location: 'Amusement Park', set: 'spyfall2',
    Role1: 'Ride Operator', Role2: 'Park Manager', Role3: 'Food Vendor',
    Role4: 'Mascot', Role5: 'Thrill-Seeker', Role6: 'Maintenance Worker',
    Role7: 'Ticket Booth Worker', Role8: 'Security Guard', Role9: 'Game Booth Attendant',
    Role10: 'First Aid Attendant', Role11: 'Parade Performer', Role12: 'Balloon Artist',
    Role13: 'Carousel Operator', Role14: 'Water Ride Attendant', Role15: 'Lost & Found Officer', Role16: 'Photography Kiosk Worker'
  },
  {
    Location: 'Art Museum', set: 'spyfall2',
    Role1: 'Curator', Role2: 'Art Restorer', Role3: 'Tour Guide',
    Role4: 'Security Guard', Role5: 'Patron', Role6: 'Struggling Artist',
    Role7: 'Gallery Director', Role8: 'Art Appraiser', Role9: 'Education Officer',
    Role10: 'Acquisitions Specialist', Role11: 'Conservationist', Role12: 'Auction Specialist',
    Role13: 'Intern', Role14: 'Fundraiser', Role15: 'Gift Shop Manager', Role16: 'School Group Teacher'
  },
  {
    Location: 'Candy Factory', set: 'spyfall2',
    Role1: 'Factory Manager', Role2: 'Chocolatier', Role3: 'Quality Taster',
    Role4: 'Machine Operator', Role5: 'Packaging Worker', Role6: 'Candy Inventor',
    Role7: 'Food Safety Inspector', Role8: 'Flavor Chemist', Role9: 'Marketing Manager',
    Role10: 'Supply Chain Manager', Role11: 'Shift Supervisor', Role12: 'Maintenance Engineer',
    Role13: 'Warehouse Worker', Role14: 'Transport Driver', Role15: 'Mold Designer', Role16: 'Caramel Specialist'
  },
  {
    Location: 'Cat Show', set: 'spyfall2',
    Role1: 'Judge', Role2: 'Breeder', Role3: 'Groomer',
    Role4: 'Cat Owner', Role5: 'Spectator', Role6: 'Veterinarian',
    Role7: 'Show Organizer', Role8: 'Trophy Presenter', Role9: 'Photographer',
    Role10: 'Kitten Trainer', Role11: 'DNA Test Specialist', Role12: 'Cat Food Vendor',
    Role13: 'Commentator', Role14: 'Certificate Issuer', Role15: 'Security', Role16: 'Breed Registrar'
  },
  {
    Location: 'Cemetery', set: 'spyfall2',
    Role1: 'Gravedigger', Role2: 'Funeral Director', Role3: 'Groundskeeper',
    Role4: 'Grieving Visitor', Role5: 'Ghost Tour Guide', Role6: 'Stone Carver',
    Role7: 'Mortician', Role8: 'Florist', Role9: 'Historian',
    Role10: 'Priest', Role11: 'Family Lawyer', Role12: 'Cemetery Manager',
    Role13: 'Coffin Maker', Role14: 'Security Guard', Role15: 'Genealogist', Role16: 'Epitaph Writer'
  },
  {
    Location: 'Coal Mine', set: 'spyfall2',
    Role1: 'Mine Foreman', Role2: 'Coal Miner', Role3: 'Safety Inspector',
    Role4: 'Explosives Expert', Role5: 'Canary Handler', Role6: 'Cart Pusher',
    Role7: 'Ventilation Engineer', Role8: 'Rock Driller', Role9: 'Hoist Operator',
    Role10: 'Geologist', Role11: 'Rescue Team Leader', Role12: 'Mine Surveyor',
    Role13: 'Conveyor Belt Operator', Role14: 'Coal Sorter', Role15: 'Water Pump Operator', Role16: 'Mine Doctor'
  },
  {
    Location: 'Construction Site', set: 'spyfall2',
    Role1: 'Foreman', Role2: 'Crane Operator', Role3: 'Bricklayer',
    Role4: 'Electrician', Role5: 'Architect', Role6: 'Safety Inspector',
    Role7: 'Plumber', Role8: 'Welder', Role9: 'Site Engineer',
    Role10: 'Demolition Expert', Role11: 'Scaffolding Specialist', Role12: 'Surveyor',
    Role13: 'Project Manager', Role14: 'Material Supplier', Role15: 'Concrete Mixer Operator', Role16: 'Heavy Equipment Operator'
  },
  {
    Location: 'Gaming Convention', set: 'spyfall2',
    Role1: 'Game Developer', Role2: 'Cosplayer', Role3: 'Tournament Referee',
    Role4: 'Merch Seller', Role5: 'Speed Runner', Role6: 'Casual Fan',
    Role7: 'Publisher Rep', Role8: 'Twitch Streamer', Role9: 'Voice Actor',
    Role10: 'Board Game Designer', Role11: 'Esports Coach', Role12: 'Convention Organizer',
    Role13: 'Food Court Worker', Role14: 'Artist Alley Creator', Role15: 'Media Journalist', Role16: 'Prize Sponsor'
  },
  {
    Location: 'Gas Station', set: 'spyfall2',
    Role1: 'Cashier', Role2: 'Mechanic', Role3: 'Manager',
    Role4: 'Trucker', Role5: 'Night Shift Attendant', Role6: 'Squeegee Kid',
    Role7: 'Car Wash Operator', Role8: 'Lottery Ticket Seller', Role9: 'Road Trip Traveler',
    Role10: 'Delivery Driver', Role11: 'Fuel Tanker Driver', Role12: 'Convenience Store Worker',
    Role13: 'Tire Repairman', Role14: 'Tow Truck Dispatcher', Role15: 'Police Officer', Role16: 'Lost Tourist'
  },
  {
    Location: 'Harbor Docks', set: 'spyfall2',
    Role1: 'Harbormaster', Role2: 'Longshoreman', Role3: 'Customs Officer',
    Role4: 'Fisherman', Role5: 'Ferry Captain', Role6: 'Yacht Owner',
    Role7: 'Maritime Lawyer', Role8: 'Boat Mechanic', Role9: 'Port Security',
    Role10: 'Cargo Inspector', Role11: 'Sailing Instructor', Role12: 'Marine Biologist',
    Role13: 'Tugboat Captain', Role14: 'Naval Officer', Role15: 'Dock Worker', Role16: 'Smuggler'
  },
  {
    Location: 'Ice Hockey Stadium', set: 'spyfall2',
    Role1: 'Goalie', Role2: 'Right Wing', Role3: 'Coach',
    Role4: 'Referee', Role5: 'Zamboni Driver', Role6: 'Die-Hard Fan',
    Role7: 'Team Captain', Role8: 'Defenseman', Role9: 'Equipment Manager',
    Role10: 'Sports Broadcaster', Role11: 'Cheerleader', Role12: 'Stadium Security',
    Role13: 'Penalty Box Official', Role14: 'Physiotherapist', Role15: 'Scout', Role16: 'Jersey Seller'
  },
  {
    Location: 'Jail', set: 'spyfall2',
    Role1: 'Warden', Role2: 'Guard', Role3: 'Prisoner',
    Role4: 'Lawyer', Role5: 'Chaplain', Role6: 'Parole Officer',
    Role7: 'Prison Doctor', Role8: 'Counselor', Role9: 'Corrections Officer',
    Role10: 'Administrative Staff', Role11: 'Undercover Cop', Role12: 'Gang Leader',
    Role13: 'Informant', Role14: 'Visitor', Role15: 'Kitchen Worker', Role16: 'Prison Librarian'
  },
  {
    Location: 'Jazz Club', set: 'spyfall2',
    Role1: 'Saxophone Player', Role2: 'Vocalist', Role3: 'Bartender',
    Role4: 'Club Owner', Role5: 'Jazz Critic', Role6: 'Regular Patron',
    Role7: 'Trumpet Player', Role8: 'Pianist', Role9: 'Drummer',
    Role10: 'Booking Agent', Role11: 'Sound Engineer', Role12: 'VIP Guest',
    Role13: 'Lighting Technician', Role14: 'Hat Check Attendant', Role15: 'Late-Night Cook', Role16: 'Jazz Historian'
  },
  {
    Location: 'Library', set: 'spyfall2',
    Role1: 'Head Librarian', Role2: 'Archivist', Role3: "Children's Librarian",
    Role4: 'IT Specialist', Role5: 'Bookworm', Role6: 'Quiet Rebel',
    Role7: 'Research Librarian', Role8: 'Volunteer', Role9: 'Study Room Monitor',
    Role10: 'Rare Books Custodian', Role11: 'Interlibrary Loan Officer', Role12: 'Digital Resources Manager',
    Role13: 'Library Security', Role14: 'Book Donor', Role15: 'Reading Program Coordinator', Role16: 'Local History Expert'
  },
  {
    Location: 'Night Club', set: 'spyfall2',
    Role1: 'DJ', Role2: 'Bouncer', Role3: 'Bartender',
    Role4: 'VIP Guest', Role5: 'Promoter', Role6: 'Coat Check Attendant',
    Role7: 'Club Owner', Role8: 'Cocktail Waitress', Role9: 'Lighting Director',
    Role10: 'Limo Driver', Role11: 'Paparazzi', Role12: 'Underage Crasher',
    Role13: 'Sound Engineer', Role14: 'Social Media Influencer', Role15: 'Floor Manager', Role16: 'Photographer'
  },
  {
    Location: 'Race Track', set: 'spyfall2',
    Role1: 'Race Car Driver', Role2: 'Pit Crew Chief', Role3: 'Race Engineer',
    Role4: 'Bookmaker', Role5: 'Commentator', Role6: 'Reckless Fan',
    Role7: 'Team Owner', Role8: 'Tire Specialist', Role9: 'Fueling Technician',
    Role10: 'Flagman', Role11: 'Track Marshal', Role12: 'Safety Car Driver',
    Role13: 'Sponsor Rep', Role14: 'Qualifying Official', Role15: 'Telemetry Analyst', Role16: 'Mechanic'
  },
  {
    Location: 'Retirement Home', set: 'spyfall2',
    Role1: 'Director', Role2: 'Nurse', Role3: 'Resident',
    Role4: 'Activities Coordinator', Role5: 'Visiting Grandchild', Role6: 'Physical Therapist',
    Role7: 'Social Worker', Role8: 'Chef', Role9: 'Night Supervisor',
    Role10: 'Occupational Therapist', Role11: 'Dementia Specialist', Role12: 'Chaplain',
    Role13: 'Maintenance Worker', Role14: 'Laundry Staff', Role15: 'Weekend Volunteer', Role16: 'Transport Driver'
  },
  {
    Location: 'Rock Concert', set: 'spyfall2',
    Role1: 'Lead Guitarist', Role2: 'Drummer', Role3: 'Tour Manager',
    Role4: 'Roadie', Role5: 'Groupie', Role6: 'Security Guard',
    Role7: 'Bass Player', Role8: 'Vocalist', Role9: 'Stage Manager',
    Role10: 'Lighting Tech', Role11: 'Sound Engineer', Role12: 'Merchandise Seller',
    Role13: 'Backstage Pass Holder', Role14: 'Music Journalist', Role15: 'Festival Photographer', Role16: 'Green Room Chef'
  },
  {
    Location: 'Sightseeing Bus', set: 'spyfall2',
    Role1: 'Tour Guide', Role2: 'Bus Driver', Role3: 'Tourist',
    Role4: 'Local Historian', Role5: 'Pickpocket', Role6: 'Exchange Student',
    Role7: 'Travel Blogger', Role8: 'Guidebook Author', Role9: 'Sleepy Backpacker',
    Role10: 'Bus Mechanic', Role11: 'Ticketing Agent', Role12: 'Corporate Tourist',
    Role13: 'Enthusiastic Visitor', Role14: 'Child on School Trip', Role15: 'Retired Traveler', Role16: 'Documentary Filmmaker'
  },
  {
    Location: 'Stadium', set: 'spyfall2',
    Role1: 'Team Captain', Role2: 'Coach', Role3: 'Referee',
    Role4: 'Announcer', Role5: 'Hotdog Vendor', Role6: 'Die-Hard Fan',
    Role7: 'Sports Journalist', Role8: 'Team Mascot', Role9: 'Stadium Security',
    Role10: 'Ticket Scanner', Role11: 'Groundskeeper', Role12: 'Medical Staff',
    Role13: 'Away Team Fan', Role14: 'Talent Scout', Role15: 'Social Media Manager', Role16: 'Seat Usher'
  },
  {
    Location: 'Subway', set: 'spyfall2',
    Role1: 'Train Driver', Role2: 'Conductor', Role3: 'Busker',
    Role4: 'Commuter', Role5: 'Pickpocket', Role6: 'Station Manager',
    Role7: 'Ticket Inspector', Role8: 'Maintenance Worker', Role9: 'Platform Guard',
    Role10: 'Rush Hour Commuter', Role11: 'Tourist', Role12: 'Subway Artist',
    Role13: 'Lost Passenger', Role14: 'System Dispatcher', Role15: 'Transit Vendor', Role16: 'Transit Police'
  },
  {
    Location: 'The U.N.', set: 'spyfall2',
    Role1: 'Secretary-General', Role2: 'Ambassador', Role3: 'Interpreter',
    Role4: 'Security Officer', Role5: 'Journalist', Role6: 'Protester',
    Role7: 'Legal Counsel', Role8: 'Peacekeeping Commander', Role9: 'Human Rights Investigator',
    Role10: 'Head of State', Role11: 'Cultural Attaché', Role12: 'Communications Director',
    Role13: 'NGO Representative', Role14: 'Negotiator', Role15: 'Technical Adviser', Role16: 'Press Secretary'
  },
  {
    Location: 'Vineyard', set: 'spyfall2',
    Role1: 'Winemaker', Role2: 'Sommelier', Role3: 'Harvest Worker',
    Role4: 'Tour Guide', Role5: 'Wine Critic', Role6: 'Cellar Master',
    Role7: 'Vineyard Owner', Role8: 'Grape Sorter', Role9: 'Wine Chemist',
    Role10: 'Estate Manager', Role11: 'Barrel Maker', Role12: 'Irrigation Specialist',
    Role13: 'Wine Educator', Role14: 'Export Manager', Role15: 'Restaurant Partner', Role16: 'Harvest Festival Coordinator'
  },
  {
    Location: 'Wedding', set: 'spyfall2',
    Role1: 'Bride', Role2: 'Groom', Role3: 'Best Man',
    Role4: 'Maid of Honor', Role5: 'Wedding Planner', Role6: 'Officiant',
    Role7: 'Flower Girl', Role8: 'Ring Bearer', Role9: 'Catering Manager',
    Role10: 'Wedding Photographer', Role11: 'DJ', Role12: 'Florist',
    Role13: 'Mother of the Bride', Role14: 'Father of the Groom', Role15: 'Groomsman', Role16: 'Bridesmaid'
  },
  {
    Location: 'Zoo', set: 'spyfall2',
    Role1: 'Zookeeper', Role2: 'Veterinarian', Role3: 'Tour Guide',
    Role4: 'Gift Shop Worker', Role5: 'Conservation Expert', Role6: 'School Child',
    Role7: 'Animal Nutritionist', Role8: 'Zoo Director', Role9: 'Education Officer',
    Role10: 'Reptile Specialist', Role11: 'Primate Handler', Role12: 'Safari Photographer',
    Role13: 'Volunteer', Role14: 'Zoo Architect', Role15: 'Aquarium Keeper', Role16: 'Nocturnal House Keeper'
  },
];

module.exports = BUILTIN_LOCATIONS;
