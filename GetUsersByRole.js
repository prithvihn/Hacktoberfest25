/**
 * Script Include: GetUsersByRole
 * Description: Retrieves a list of active user sys_ids who possess a specific role.
 *
 * Usage Example (in a Business Rule or Background Script):
 *
 * var roleName = 'itil';
 * var userList = new GetUsersByRole().getActiveUsersByRole(roleName);
 * gs.info('Active users with ' + roleName + ': ' + userList.join(', '));
 *
 */
var GetUsersByRole = Class.create();
GetUsersByRole.prototype = {
    initialize: function() {
        // Constructor, can be used for initialization if needed
    },

    /**
     * Finds the sys_ids of all active users with a specified role.
     * @param {string} roleName - The name of the role to search for (e.g., 'itil', 'admin').
     * @returns {Array} An array of user sys_ids. Returns an empty array if no users are found or the role is invalid.
     */
    getActiveUsersByRole: function(roleName) {
        var userSysIds = [];

        if (!roleName) {
            gs.error("Role name cannot be empty in GetUsersByRole.getActiveUsersByRole()");
            return userSysIds;
        }

        // 1. Get the sys_id of the role
        var grRole = new GlideRecord('sys_user_role');
        if (!grRole.get('name', roleName)) {
            gs.warn("Role not found: " + roleName);
            return userSysIds;
        }
        var roleSysId = grRole.sys_id;

        // 2. Query the sys_user_has_role table for active users
        var grUserRole = new GlideRecord('sys_user_has_role');
        grUserRole.addQuery('role', roleSysId);
        grUserRole.query();

        // 3. Iterate and collect the active user sys_ids
        var userQuery = 'active=true^EQ'; // Query for active users
        var userGr = new GlideRecord('sys_user');
        userGr.addEncodedQuery(userQuery);
        
        while (grUserRole.next()) {
            var userId = grUserRole.user.sys_id;
            
            // Re-query the sys_user table for active status (more efficient mass-querying is possible, but this is simple)
            // A better way is to collect all user IDs and then query the sys_user table once with 'sys_idIN'
            if (userGr.get(userId) && userGr.active.toString() == 'true') {
                 userSysIds.push(userId.toString());
            }
        }
        
        // Use a Set to ensure unique users (a user might have the role multiple times)
        var uniqueUserSysIds = Array.from(new Set(userSysIds));

        return uniqueUserSysIds;
    },

    type: 'GetUsersByRole'
};
