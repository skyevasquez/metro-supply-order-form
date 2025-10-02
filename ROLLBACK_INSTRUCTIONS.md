# How to Revert/Rollback Firebase Hosting Deployment

## Issue
Files from the Metro Supply Order Form were accidentally deployed to the wrong Firebase project: `sales-dashboard-1759420079`

## Solution Options

### Option 1: Rollback via Firebase Console (Easiest)

1. Go to Firebase Console:
   https://console.firebase.google.com/project/sales-dashboard-1759420079/hosting

2. Click on "Hosting" in the left sidebar

3. Click on the "Release history" or "Version history" tab

4. You should see a list of deployments with timestamps

5. Find the deployment from before October 2, 2025 13:33:06

6. Click the three dots (⋮) menu next to that version

7. Click "Rollback to this version"

8. Confirm the rollback

This will restore your previous site content.

---

### Option 2: Delete the Deployment (if there was nothing before)

If the Sales Dashboard project didn't have a website before:

1. Go to: https://console.firebase.google.com/project/sales-dashboard-1759420079/hosting

2. Click "Release history"

3. Click "Delete all releases" or delete each one manually

This will effectively remove the deployed content.

---

### Option 3: Deploy a Maintenance Page (Temporary)

I've created a temporary maintenance page. To deploy it:

```bash
cd /Users/skyevasquez/Projects/metro-supply-order-form/.temp_rollback
firebase deploy --only hosting --project sales-dashboard-1759420079
cd ..
```

Then follow Option 1 or 2 after that.

---

## What Was Deployed (that needs to be reverted)

- Firestore Rules (for metro-supply-order-form)
- Firestore Indexes (3 composite indexes)
- 55 files including:
  - index.html (order form)
  - auth.html (login page)
  - script.js, styles.css
  - All Firebase integration code
  - All documentation files

---

## Important: Firestore Rules & Indexes

The Firestore rules and indexes were also deployed. You may want to revert those too:

### Revert Firestore Rules:

If you had previous rules, you need to redeploy them. If you didn't have any Firestore setup before, you can set it back to default:

1. Go to: https://console.firebase.google.com/project/sales-dashboard-1759420079/firestore/rules

2. Replace the rules with the default or your previous rules

3. Click "Publish"

---

## Create New Firebase Project (Recommended)

Instead of using an existing project, create a NEW dedicated project for the Metro Supply Order Form:

1. Go to: https://console.firebase.google.com

2. Click "Add project"

3. Name it: "metro-supply-orders" or similar

4. Follow the setup steps

5. Then in the metro-supply-order-form directory, run:

```bash
# Create new .firebaserc with the correct project
echo '{
  "projects": {
    "default": "YOUR-NEW-PROJECT-ID"
  }
}' > .firebaserc

# Deploy to the correct project
firebase deploy
```

---

## Clean Up

After you've resolved this, delete the temporary files:

```bash
rm -rf /Users/skyevasquez/Projects/metro-supply-order-form/.temp_rollback
rm /Users/skyevasquez/Projects/metro-supply-order-form/ROLLBACK_INSTRUCTIONS.md
```

---

## Prevention

Always verify which project you're deploying to:

```bash
# Check current project
firebase projects:list

# Check what will be deployed
firebase use

# Or specify project explicitly
firebase deploy --project YOUR-PROJECT-ID
```

---

## Summary

**Easiest Fix:** Use Firebase Console (Option 1) to rollback to the previous version via the Release History.

**Best Long-term Solution:** Create a dedicated Firebase project for Metro Supply Order Form instead of reusing Sales Dashboard.
