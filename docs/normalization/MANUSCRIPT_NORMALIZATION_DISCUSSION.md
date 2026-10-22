#### Database Normalization

Following the conceptual and logical schema defined in the Entity Relationship Diagram (Figure 14), database normalization was performed to organize the logical data structure of the Web-Based AI-Assisted Ordinance Information System (Cabanatuan City Ordinance Portal), reduce unnecessary data redundancy, and establish appropriate dependencies among related civic and legal data elements. The normalization process documented the progressive refinement of the database structure from Unnormalized Form (UNF) to First Normal Form (1NF), Second Normal Form (2NF), and Third Normal Form (3NF).

The UNF (Figure 15) represented the initial broad data structure in which related and repeating governance information—such as user credentials, administrative role privileges, barangay geopolitical jurisdictions, legislative ordinance records, statutory articles, penalty clauses, uploaded scanned PDF copies, semantic tags, citizen community reports, civic news announcements, AI chat consultation sessions, conversational dialogue messages, and system parameters—had not yet been separated into normalized relations. During 1NF (Figure 16), repeating groups were eliminated, data elements were organized into atomic values, and each relation was given a primary key, utilizing composite primary keys for child relations such as ordinance tags and chat messages. The 2NF stage (Figure 17) removed partial functional dependencies: individual chat messages and ordinance tags were keyed by their own dedicated identifiers, citizen community reports and civic news bulletins were decoupled into independent relations, and user authentication records and barangay profiles were separated from legislative transaction tables. In 3NF (Figure 18), remaining transitive dependencies were eliminated by removing barangay, submitter, reviewer, reporter, and user names that depended on referenced foreign keys rather than on the primary key, leaving the nine relations of the implemented schema (`users`, `barangays`, `ordinances`, `ordinance_tags`, `reports`, `news_items`, `chat_sessions`, `chat_messages`, and `system_settings`), which correspond directly to the entities modeled in the ERD. Contact details in community reports were intentionally retained within the reports relation to support optional citizen anonymity while preserving contact verification without enforcing mandatory user account registration.

The resulting normalized structure provided a dependable basis for maintaining related records, eliminating data anomalies (insertion, update, and deletion anomalies), and ensuring high transaction throughput across the web portal and the Retrieval-Augmented Generation (RAG) AI assistant. The normalized relations subsequently served as the basis for the Data Dictionary, which documented the field-level structure of the database.

**Figure 15**  
*Unnormalized Form of the Cabanatuan City Ordinance Portal Database Structure*

![Figure 15: Unnormalized Form of the Cabanatuan City Ordinance Portal Database Structure](file:///c:/.JC/Antigravity-Projects/Capstone%20Project%20v2/app/docs/normalization/output/01_UNF_Cabanatuan_Ordinance_Portal.png)

**Figure 16**  
*First Normal Form (1NF) of the Cabanatuan City Ordinance Portal Database Structure*

![Figure 16: First Normal Form (1NF) of the Cabanatuan City Ordinance Portal Database Structure](file:///c:/.JC/Antigravity-Projects/Capstone%20Project%20v2/app/docs/normalization/output/02_1NF_Cabanatuan_Ordinance_Portal.png)

**Figure 17**  
*Second Normal Form (2NF) of the Cabanatuan City Ordinance Portal Database Structure*

![Figure 17: Second Normal Form (2NF) of the Cabanatuan City Ordinance Portal Database Structure](file:///c:/.JC/Antigravity-Projects/Capstone%20Project%20v2/app/docs/normalization/output/03_2NF_Cabanatuan_Ordinance_Portal.png)

**Figure 18**  
*Third Normal Form (3NF) of the Cabanatuan City Ordinance Portal Database Structure*

![Figure 18: Third Normal Form (3NF) of the Cabanatuan City Ordinance Portal Database Structure](file:///c:/.JC/Antigravity-Projects/Capstone%20Project%20v2/app/docs/normalization/output/04_3NF_Cabanatuan_Ordinance_Portal.png)
